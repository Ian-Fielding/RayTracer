/* 	mathScary.js

	This file contains the "scary" math of this project, meaning it handles
	most of the ray and color methods/interfaces.
*/


let EPSILON = 0.0000001;

// updates the canvas by shooting rays through each image pixel
function updateCanvas() {

	// goodobjects is list of active scene objects
	let goodobjects = objects.filter((obj) => obj.active && !(
		obj instanceof Light));

	// goodlights is list of active scene lights
	let goodlights = objects.filter((obj) => obj.active && (
		obj instanceof Light));

	// width and height of scene screen
	let w = 2 / Math.sqrt(3); // is 2tan(fov/2) where fov = 60 degrees
	let h = w * canvasHeight / canvasWidth;

	// the directional vectors for traversing along the scene
	let up = new Vector(0, 0, 1);
	let left = up.cross(look_direction).normalize();
	let right = left.negate();
	let down = up.negate();

	let startPoint = camera_center
		.add(
		look_direction) // at this point the vector points to center of screen
		.add(left.scale(w /
		2)) // at this point the vector points to center left of screen
		.add(up.scale(h /
		2)); // at this point the vector points to the top left of screen

	// number of rays per image pixel to shoot
	let numRays = ANTI_ALIAS ? ANTI_ALIAS_NUM_RAYS : 1;

	// counts for recording purposes
	let totalCount = Math.ceil(canvasWidth * canvasHeight / (PIXEL_SIZE *
		PIXEL_SIZE) * numRays);
	let count = 0;

	console.log("Starting render!");

	let colors = [];
	for(let x = 0; x < canvasWidth; x++) {
		for(let y = 0; y < canvasHeight; y++) {

			// if is upper-left corner of image pixel, compute the color of that pixel
			// if PIXEL_SIZE is 1, this runs for every x,y
			if(x % PIXEL_SIZE == 0 && y % PIXEL_SIZE == 0) {

				// shoots ray(s) through pixel, records the color(s) in colors array
				colors = [];
				for(let i = 0; i < numRays; i++) {
					let dir = startPoint
						.add(right.scale(x * w /
						canvasWidth)) // moves startPoint along x-axis
						.add(down.scale(y * h /
						canvasHeight)) // moves startPoint along y-axis
						.sub(camera_center); // offset the camera's center

					// if shooting multiple vectors, add some randomness to dir
					if(ANTI_ALIAS) {
						let dx = w / canvasWidth;
						let dy = h / canvasHeight;
						let ax = (dx * Math.random()) - (dx / 2);
						let ay = (dy * Math.random()) - (dy / 2);
						dir = dir.add(right.scale(ax)).add(down.scale(ay));
					}

					// shoot ray, record and store color
					let ray = new Ray(camera_center, dir);
					colors.push(getColor(ray, goodobjects, goodlights));

					// prints rendering update
					count++;
					if(count % 1000 == 0)
						console.log(
							`   ${count/1000} of ${Math.floor(totalCount/1000)}`
							);
				}

				// places color
				let color = Color.average(colors);
				let off = (y * id.width + x) * 4;
				pixels[off] = color.r;
				pixels[off + 1] = color.g;
				pixels[off + 2] = color.b;
			} else {

				// if x,y is not upper-left corner of image pixel, copy the corner's color
				let off = (y * id.width + x) * 4;
				let old = ((y - (y % PIXEL_SIZE)) * id.width + x - (x %
					PIXEL_SIZE)) * 4;
				pixels[off] = pixels[old];
				pixels[off + 1] = pixels[old + 1];
				pixels[off + 2] = pixels[old + 2];
			}
		}
	}

	console.log("Done rendering!");
	ctx.putImageData(id, 0, 0);
}


// given a Ray ray, [Obj] goodobjects, [Light] goodlights and an int numReflections,
// calculates color the ray will have while only considering goodObjects and goodLights.
// if numReflections is 0, the ray will not reflect
function getColor(ray, goodobjects, goodlights, numReflections = 8) {

	// the time, object and normal vector the ray hits respectively
	let minTime = Number.MAX_VALUE;
	let minObject = null;
	let minNormal = new Vector(0, 0, 0);

	// iterate through the objects and find the object hit
	for(let i = 0; i < goodobjects.length; i++) {
		let obj = goodobjects[i];
		let intersect = ray.timeToIntersection(obj);
		let t = intersect.t;

		if(0 < t && t < minTime) {
			minTime = t;
			minObject = obj;
			minNormal = intersect.n;
		}
	}

	// if minObject is null, no objects were hit were hit with the ray
	if(minObject == null)
		return BACKGROUND_COLOR.randVariant(15);

	// colors for ambient, diffuse and specular lighting
	let ambient = minObject.color;
	let diffuse = new Color(0);
	let specular = new Color(0);

	// the point on the object hit by the ray
	let point = ray.getVec(minTime);

	// iterate through lights
	a: for(let i = 0; i < goodlights.length; i++) {
		let light = goodlights[i];

		// vectors for lighting
		let l = point.sub(light.pos).normalize();
		let n = minNormal;
		let r = n.scale(2 * l.dot(n)).sub(l).normalize();
		let v = ray.dir.negate().normalize();

		if(SHADOWS) {
			// sets up ray for checking if an object intersects before the light
			let checkDir = l.negate();
			let checkPos = point.add(checkDir.scale(0.001));
			let checkRay = new Ray(checkPos, checkDir);

			for(let j = 0; j < goodobjects.length; j++) {
				let obj = goodobjects[j];

				// ignore self-shadows
				// if(obj==minObject)
				//   continue;

				// if intersection, ignore the light completely
				let check = checkRay.timeToIntersection(obj);
				if(check.t > 0 && check.t < 1)
					break a;

			}

		}

		// sets up diffuse lighting
		let diffuseDot = l.dot(n);
		if(diffuseDot < 0)
			diffuse = diffuse.add(new Color(-100 * light.intensity *
				diffuseDot));

		// sets up specular lighting
		let specularDot = r.dot(v);
		if(specularDot < 0)
			specular = specular.add(new Color(-150 * light.intensity * Math
				.pow(specularDot, 7)));
	}

	// color is final color at the point
	let color = ambient.add(diffuse).add(specular);

	// if no reflections are left (or the object can't reflect) return the color
	if(numReflections == 0 || minObject.mirror == 0)
		return color;

	// otherwise, reflect the ray and get its color
	let newDir = ray.dir.sub(minNormal.scale(2 * ray.dir.dot(minNormal)))
		.normalize(); // reflected light source
	let newPos = point.add(newDir.scale(0.001));
	let newRay = new Ray(newPos, newDir)
	let reflected = getColor(newRay, goodobjects, goodlights, numReflections -
		1);

	// combines the color of this object with the reflected ray
	// (1-mirror)color+(mirror)reflected 
	return color.scale(1 - minObject.mirror).add(reflected.scale(minObject
		.mirror));
}


// given ray and sphere object, computes the time the ray will hit the object
// and the normal vector the ray will intersect the object at
function timeToSphereIntersection(ray, obj) {
	// vectors
	let p = ray.pos;
	let d = ray.dir;
	let c = obj.pos;
	let r = obj.size;

	// quadratic formula vars
	let A = d.dot(d);
	let B = d.dot(p.sub(c));
	let C = (p.sub(c)).dot(p.sub(c)) - r * r;

	// if determinant is negative, ray will not intersect sphere
	let det = B * B - A * C;
	if(det < 0)
		return {
			t: -1,
			n: null
		};

	// need to make sure the smallest non-negative time is returned
	let t0 = (-B + Math.sqrt(det)) / (A);
	let t1 = (-B - Math.sqrt(det)) / (A);
	let t = 0;
	if(t0 < 0 && t1 < 0)
		t = -1;
	else if(t0 < 0)
		t = t1;
	else if(t1 < 0)
		t = t0;
	else
		t = Math.min(t0, t1);

	// returns object of time and normal
	return {
		t: t,
		n: ray.getVec(t).sub(c).normalize()
	};
}

// performs the Möller–Trumbore intersection algorithm for a ray and a mesh
// object. Returns the time the ray will hit the mesh and the normal of the
// hit triangle
// adapted from https://en.wikipedia.org/wiki/M%C3%B6ller%E2%80%93Trumbore_intersection_algorithm
function mt(ray, obj) {
	let arr = obj.tris;

	// the time, triangle and (u,v) values of the hit triangle
	let minTime = Number.MAX_VALUE;
	let minTri = null;
	let minU, minV;

	for(let i = 0; i < arr.length; i++) {

		// performs M-T algorithm on tri
		let tri = arr[i].getOffset(obj.pos);

		// if dot product is non-negative, ray will not hit correct side
		if(ray.dir.dot(tri.n) >= 0)
			continue;

		let vertex0 = tri.v1;
		let vertex1 = tri.v2;
		let vertex2 = tri.v3;
		let edge1 = vertex1.sub(vertex0);
		let edge2 = vertex2.sub(vertex0);
		let h = ray.dir.cross(edge2);
		let a = edge1.dot(h);

		if(a > -EPSILON && a < EPSILON)
			continue; // This ray is parallel to this triangle.

		let f = 1.0 / a;
		let s = ray.pos.sub(vertex0);
		let u = f * (s.dot(h));

		if(u < 0.0 || u > 1.0)
			continue;

		let q = s.cross(edge1);
		let v = f * ray.dir.dot(q);

		if(v < 0.0 || u + v > 1.0)
			continue;

		// At this stage we can compute t to find out where the intersection point is on the line.
		let t = f * edge2.dot(q);
		if(t > EPSILON && t < minTime) {
			minTime = t;
			minTri = tri;
			minU = u;
			minV = v;
		}
	}

	// if no triangle is hit
	if(minTri == null)
		return {
			t: -1,
			n: null
		};

	// returns triangle's normal
	if(!SMOOTH_SHADING)
		return {
			t: minTime,
			n: minTri.n
		};

	// returns interpolated normal
	return {
		t: minTime,
		n: minTri.v1n.scale(1 - minU - minV).add(minTri.v2n.scale(minU)).add(
			minTri.v3n.scale(minV))
	};
}