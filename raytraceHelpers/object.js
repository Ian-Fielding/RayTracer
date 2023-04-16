/* 	object.js

	This file contains the Light and Obj classes for representing the scene
	light and objects respectively. 
*/


class Light {
	constructor(id) {
		// parameters
		this.intensity = 1; // 0<=intensity<=1
		this.pos = camera_center.add(look_direction.normalize());

		// name for record purposes
		this.id = id;
		this.name = "Light" + id;

		// true iff light is active in scene
		this.active = true;
	}

	toString() {
		return `${this.name}: Intensity=${this.intensity}; Pos=${this.pos}`;
	}

	updateTris() {}
}



class Obj {
	constructor(id) {
		// parameters
		this.color = Color.hslToRGB(0, 1, DEFAULT_HSL);
		this.mirror = 0; //0<=mirror<=1
		this.pos = camera_center.add(look_direction.normalize().scale(5));
		this.rotation = new Vector(0, 0, 0);
		this.size = 1;
		this.kind = "Sphere";

		// name for record purposes
		this.id = id;
		this.name = "Object" + id

		// true iff object is active in scene
		this.active = true;

		// vars for mesh objects
		this.file = cube;
		this.tris = [];

		this.updateTris();
	}

	// given "kind" string, updates this.kind and this.file
	setKind(kind) {
		this.kind = kind;

		if(kind == "Bunny")
			this.file = bunny;
		else if(kind == "Cube")
			this.file = cube;
		else if(kind == "Icosahedron")
			this.file = icos;
		else if(kind == "Dodecahedron")
			this.file = dodec;
		else if(kind == "Star")
			this.file = star;
	}

	// updates this.tris with the current mesh from this.file
	updateTris() {
		if(this.kind == "Sphere") {
			this.tris = [];
			return;
		}

		// determines correct scaling/shifting to account for inconsistencies
		let scalingFactor = 1;
		let shiftingFactor = new Vector(0, 0, 0);
		if(this.kind == "Bunny") {
			scalingFactor = 0.03;
			shiftingFactor = new Vector(0, 0, -1.5);
		} else if(this.kind == "Cube") {
			scalingFactor = 0.7;
		} else if(this.kind == "Star") {
			scalingFactor = 0.04;
		}
		scalingFactor *= this.size;

		// rotation matrix
		let rotmat = new RotMatrix(this.rotation.x, this.rotation.y, this
			.rotation.z);

		// maps vertex indices to list of normals of adjacent triangles
		// for Phong interpolation
		let map = new Map();

		let tris = [];
		for(let i = 0; i < this.file.vertexPositionIndices.length; i += 4) {
			let fs = this.file.vertexPositionIndices; // list of faces
			let ls = this.file.vertexPositions; // list of vertices

			// indices of vertices in this triangle
			let i1 = fs[i];
			let i2 = fs[i + 1];
			let i3 = fs[i + 2];

			// the three points on the triangle
			let v1 = new Vector(ls[3 * i1], ls[3 * i1 + 1], ls[3 * i1 + 2])
				.scale(scalingFactor)
				.add(shiftingFactor);
			let v2 = new Vector(ls[3 * i2], ls[3 * i2 + 1], ls[3 * i2 + 2])
				.scale(scalingFactor)
				.add(shiftingFactor);
			let v3 = new Vector(ls[3 * i3], ls[3 * i3 + 1], ls[3 * i3 + 2])
				.scale(scalingFactor)
				.add(shiftingFactor);

			// rotates points according to rotation matrix
			v1 = rotmat.multiply(v1);
			v2 = rotmat.multiply(v2);
			v3 = rotmat.multiply(v3);

			// new triangle
			let tri = new Triangle(v1, v2, v3, i1, i2, i3);
			tris.push(tri);

			// updates map if smooth shading
			if(SMOOTH_SHADING) {
				if(!map.has(i1))
					map.set(i1, [tri.n]);
				else
					map.get(i1).push(tri.n);
				if(!map.has(i2))
					map.set(i2, [tri.n]);
				else
					map.get(i2).push(tri.n);
				if(!map.has(i3))
					map.set(i3, [tri.n]);
				else
					map.get(i3).push(tri.n);
			}
		};

		// if smooth shading, updates the triangle vertex normals
		if(SMOOTH_SHADING) {

			// map of each vertex to its normal
			let newMap = new Map();
			for(const [k, v] of map.entries()) {
				let n = new Vector(0, 0, 0);
				v.forEach(x => n = n.add(x));
				newMap.set(k, n.normalize());
			};

			// updates each triangle vertex normal
			tris.forEach(function(tri) {
				tri.v1n = newMap.get(tri.i1);
				tri.v2n = newMap.get(tri.i2);
				tri.v3n = newMap.get(tri.i3);
			});
		}

		this.tris = tris;
	}

	toString() {
		return `${this.name}: Kind=${this.kind}; Mirror=${this.mirror}; Color=${this.color}; Pos=${this.pos}; Rot=${this.rotation}; Size=${this.size}`;
	}
}