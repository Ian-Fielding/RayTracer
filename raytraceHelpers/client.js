/* 	client.js

	This file contains code for interacting with DOM elements and for updating the canvas
*/


// screen/scene vars
let canvas, ctx, canvasWidth, canvasHeight, id, pixels;
let objects = [];

// camera vectors
let camera_center = new Vector(0, 0, 0);
let look_direction = new Vector(1, 0, 0);

// editable options
let AUTO_UPDATE = true;
let SHADOWS = true;
let ANTI_ALIAS = false;
let SMOOTH_SHADING = false;
let PIXEL_SIZE = 3;
let ANTI_ALIAS_NUM_RAYS = 4;
let CAMERA_ROTATION = 0;

// triggers when one of the "option" values are changed
function toggleOption() {
	ANTI_ALIAS = document.getElementById("toggleAntiAlias").checked;
	AUTO_UPDATE = document.getElementById("toggleAutoUpdate").checked;
	ANTI_ALIAS_NUM_RAYS = document.getElementById("toggleAntiAliasNumber")
	.value;
	PIXEL_SIZE = document.getElementById("togglePixelDensity").value;
	SHADOWS = document.getElementById("toggleShadows").checked;
	SMOOTH_SHADING = document.getElementById("toggleSmoothShading").checked;

	if(SMOOTH_SHADING)
		objects.forEach(obj => obj.updateTris());

	if(AUTO_UPDATE)
		updateCanvas();
}

// adds a "light" to the DOM
function addLight() {
	let obj = new Light(objects.length);
	objects.push(obj);

	// sets up main div
	let div = document.createElement("div");
	div.setAttribute("class", "object");
	div.setAttribute("id", obj.name);

	// smaller containers
	let titleText = elemBuilder("p", "Light", div);
	let pos = elemBuilder("div", "", div);
	let int = elemBuilder("div", "", div);

	// x chooser
	let x0 = inputBuilder("x", obj, "20%", pos, function() {
		obj.pos.x = this.value;
		console.log("Updated " + obj);
		if(AUTO_UPDATE)
			updateCanvas();

	});

	// y chooser
	let y0 = inputBuilder("y", obj, "20%", pos, function() {
		obj.pos.y = this.value;
		console.log("Updated " + obj);
		if(AUTO_UPDATE)
			updateCanvas();
	});

	// z chooser
	let z0 = inputBuilder("z", obj, "20%", pos, function() {
		obj.pos.z = this.value;
		console.log("Updated " + obj);
		if(AUTO_UPDATE)
			updateCanvas();
	});

	// i chooser
	let i0 = sliderBuilder("Intensity", obj, 0, 1, "40%", int, function() {
		obj.intensity = this.value;
		console.log("Updated " + obj);
		if(AUTO_UPDATE)
			updateCanvas();
	});

	// initialize the input attributes
	x0.setAttribute("value", obj.pos.x);
	y0.setAttribute("value", obj.pos.y);
	z0.setAttribute("value", obj.pos.z);
	i0.setAttribute("value", obj.intensity);
	x0.setAttribute("step", 0.2);
	y0.setAttribute("step", 0.2);
	z0.setAttribute("step", 0.2);

	// remove button on top right corner
	let remove = elemBuilder("button", "Remove", div);
	remove.setAttribute("class", "mini-button removal");
	remove.setAttribute("id", "r" + obj.name);
	remove.onclick = function() {
		let name = this.getAttribute("id").substring(1);
		let id = name.charAt(name.length - 1)
		document.getElementById(name).remove();
		objects[id].active = false;

		console.log(`${objects[id].name} removed`);
		if(AUTO_UPDATE)
			updateCanvas();
	}

	document.getElementById("objects").prepend(div);
	if(AUTO_UPDATE)
		updateCanvas();

	return obj;
}


// adds an "Obj" to the DOM
function addObject() {
	let obj = new Obj(objects.length);
	objects.push(obj);

	// sets up main div
	let div = document.createElement("div");
	div.setAttribute("class", "object");
	div.setAttribute("id", obj.name);

	// smaller containers
	let title = elemBuilder("div", "", div)
	let titleText = elemBuilder("p", "Object", title);
	div.appendChild(document.createElement("hr"));
	let col_row1 = elemBuilder("div", "", div);
	let col_row2 = elemBuilder("div", "", div);
	div.appendChild(document.createElement("hr"));
	let pos = elemBuilder("div", "", div);
	let int1 = elemBuilder("div", "", div);
	let int2 = elemBuilder("div", "", div);
	let int3 = elemBuilder("div", "", div);
	let size = elemBuilder("div", "", div);

	// kind chooser
	let select = selectBuilder(["Sphere", "Cube", "Icosahedron", "Dodecahedron",
		"Star", "Bunny"
	], title);
	select.onchange = function() {
		obj.setKind(this.value);
		obj.updateTris();
		console.log("Updated " + obj);
		if(AUTO_UPDATE)
			updateCanvas();
	}

	// color chooser
	let col1 = sliderBuilder("Color", obj, 0, 360, "50%", col_row1, function() {
		obj.color = Color.hslToRGB(this.value / 360, 1, DEFAULT_HSL);
		console.log("Updated " + obj);
		if(AUTO_UPDATE)
			updateCanvas();
	});

	// reflectance chooser
	let col2 = sliderBuilder("Reflectance", obj, 0, 1, "50%", col_row2,
		function() {
			obj.mirror = this.value;
			console.log("Updated " + obj);
			if(AUTO_UPDATE)
				updateCanvas();
		});

	// x chooser
	let x0 = inputBuilder("x", obj, "20%", pos, function() {
		obj.pos.x = this.value;
		console.log("Updated " + obj);
		if(AUTO_UPDATE)
			updateCanvas();

	});

	// y chooser
	let y0 = inputBuilder("y", obj, "20%", pos, function() {
		obj.pos.y = this.value;
		console.log("Updated " + obj);
		if(AUTO_UPDATE)
			updateCanvas();
	});

	// z chooser
	let z0 = inputBuilder("z", obj, "20%", pos, function() {
		obj.pos.z = this.value;
		console.log("Updated " + obj);
		if(AUTO_UPDATE)
			updateCanvas();
	});

	// rotation x chooser
	sliderBuilder("Rotation x", obj, 0, 360, "40%", int1, function() {
		obj.rotation.x = this.value;
		obj.updateTris();
		console.log("Updated " + obj);
		if(AUTO_UPDATE)
			updateCanvas();
	}).setAttribute("value", obj.rotation.x);

	// rotation y chooser
	sliderBuilder("Rotation y", obj, 0, 360, "40%", int2, function() {
		obj.rotation.y = this.value;
		obj.updateTris();
		console.log("Updated " + obj);
		if(AUTO_UPDATE)
			updateCanvas();
	}).setAttribute("value", obj.rotation.y);

	// rotation z chooser
	sliderBuilder("Rotation z", obj, 0, 360, "40%", int3, function() {
		obj.rotation.z = this.value;
		obj.updateTris();
		console.log("Updated " + obj);
		if(AUTO_UPDATE)
			updateCanvas();
	}).setAttribute("value", obj.rotation.z);

	// size chooser
	let s = inputBuilder("Size", obj, "20%", size, function() {
		obj.size = this.value;
		obj.updateTris();
		console.log("Updated " + obj);
		if(AUTO_UPDATE)
			updateCanvas();
	});

	// initialize the input attributes
	col1.setAttribute("class", "rainbow");
	col1.setAttribute("value", 0);
	col2.setAttribute("value", obj.mirror);
	x0.setAttribute("step", 0.2);
	y0.setAttribute("step", 0.2);
	z0.setAttribute("step", 0.2);
	s.setAttribute("step", 0.2);
	s.setAttribute("min", 0);
	x0.setAttribute("value", obj.pos.x);
	y0.setAttribute("value", obj.pos.y);
	z0.setAttribute("value", obj.pos.z);
	s.setAttribute("value", obj.size);

	// remove button in top right corner
	let remove = elemBuilder("button", "Remove", div);
	remove.setAttribute("class", "mini-button removal");
	remove.setAttribute("id", "r" + obj.name);
	remove.onclick = function() {
		let name = this.getAttribute("id").substring(1);
		let id = name.charAt(name.length - 1)
		document.getElementById(name).remove();
		objects[id].active = false;

		console.log(`${objects[id].name} removed`);
		if(AUTO_UPDATE)
			updateCanvas();
	}


	document.getElementById("objects").prepend(div);
	if(AUTO_UPDATE)
		updateCanvas();

	return obj;
}


// clears object from scene
function clearObjects() {
	objects = [];
	document.getElementById("objects").innerHTML = "";
	if(AUTO_UPDATE)
		updateCanvas();
}


// initializes canvas object
function initCanvas() {
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
	canvasWidth = canvas.width;
	canvasHeight = canvas.height;
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	id = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
	pixels = id.data;

	for(let x = 0; x < canvasWidth; x++) {
		for(let y = 0; y < canvasHeight; y++) {
			let off = (y * id.width + x) * 4;
			pixels[off + 3] = 255;
		}
	}

}


// sets up initial editable parameter values
document.getElementById("toggleAutoUpdate").checked = AUTO_UPDATE;
document.getElementById("toggleAntiAlias").checked = ANTI_ALIAS;
document.getElementById("togglePixelDensity").value = PIXEL_SIZE;
document.getElementById("toggleAntiAliasNumber").value = ANTI_ALIAS_NUM_RAYS;
document.getElementById("toggleShadows").checked = SHADOWS;
document.getElementById("toggleSmoothShading").checked = SMOOTH_SHADING;

// sets up camera rotation
let i0 = sliderBuilder("Camera Rotation", null, -180, 180, "80%", document
	.getElementById("div-for-rotation"),
	function() {
		CAMERA_ROTATION = this.value;
		let angle = -CAMERA_ROTATION * Math.PI / 180;
		look_direction = new Vector(Math.cos(angle), Math.sin(angle), 0);
		console.log("Updated " + CAMERA_ROTATION);
		if(AUTO_UPDATE)
			updateCanvas();
	}).setAttribute("value", CAMERA_ROTATION);


initCanvas();


// sets up initial objects to the scene
// all following lines can be removed to start with a clear canvas
let obj1 = addObject();
let obj2 = addObject();
let obj3 = addObject();
let l1 = addLight();

obj1.pos = new Vector(5, 0.4, 1);
obj1.size = 1;
obj1.mirror = 0.5;
obj1.color = Color.hslToRGB(200 / 360, 1, DEFAULT_HSL);

obj2.pos = new Vector(4, -1, 0);
obj2.size = 0.5;
obj2.mirror = 0;
obj2.color = Color.hslToRGB(100 / 360, 1, DEFAULT_HSL);


obj3.pos = new Vector(4, 1.4, -1.6);
obj3.size = 1.8;
obj3.mirror = 0.1;
obj3.color = Color.hslToRGB(300 / 360, 1, DEFAULT_HSL);

l1.pos = new Vector(1, 1, 3);



document.getElementById("x-Object0").setAttribute("value", obj1.pos.x);
document.getElementById("y-Object0").setAttribute("value", obj1.pos.y);
document.getElementById("z-Object0").setAttribute("value", obj1.pos.z);
document.getElementById("Size-Object0").setAttribute("value", obj1.size);
document.getElementById("Reflectance-Object0").setAttribute("value", obj1
	.mirror);
document.getElementById("Color-Object0").setAttribute("value", 200);

document.getElementById("x-Object1").setAttribute("value", obj2.pos.x);
document.getElementById("y-Object1").setAttribute("value", obj2.pos.y);
document.getElementById("z-Object1").setAttribute("value", obj2.pos.z);
document.getElementById("Size-Object1").setAttribute("value", obj2.size);
document.getElementById("Reflectance-Object1").setAttribute("value", obj2
	.mirror);
document.getElementById("Color-Object1").setAttribute("value", 100);

document.getElementById("x-Object2").setAttribute("value", obj3.pos.x);
document.getElementById("y-Object2").setAttribute("value", obj3.pos.y);
document.getElementById("z-Object2").setAttribute("value", obj3.pos.z);
document.getElementById("Size-Object2").setAttribute("value", obj3.size);
document.getElementById("Reflectance-Object2").setAttribute("value", obj3
	.mirror);
document.getElementById("Color-Object2").setAttribute("value", 300);

document.getElementById("x-Light3").setAttribute("value", l1.pos.x);
document.getElementById("y-Light3").setAttribute("value", l1.pos.y);
document.getElementById("z-Light3").setAttribute("value", l1.pos.z);


updateCanvas();