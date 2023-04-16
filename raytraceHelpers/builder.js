/* 	builder.js

	This file contains code for building DOM elements
*/


// returns DOM elements
function elemBuilder(name, innerHTML, par) {
	let elem = document.createElement(name);
	elem.innerHTML = innerHTML;
	elem.setAttribute("class", "object-elem");
	par.appendChild(elem);
	return elem;
}

// builds "select" input objects
function selectBuilder(values, par) {
	let elem = elemBuilder("select", "", par);
	for(let i = 0; i < values.length; i++) {
		let entry = elemBuilder("option", values[i], elem);
		entry.setAttribute("value", values[i]);
	}
	return elem;
}

// builds "number" input objects
function inputBuilder(lab, obj, width, par, oninput) {
	let labx = elemBuilder("label", lab + ":", par);
	labx.setAttribute("for", lab + "-" + obj.name);

	let varx = elemBuilder("input", "", par);
	varx.setAttribute("class", "object-elem input");
	varx.setAttribute("id", lab + "-" + obj.name);
	varx.setAttribute("name", lab + "-" + obj.name);
	varx.setAttribute("type", "number");
	varx.setAttribute("value", 0);
	varx.setAttribute("style", "max-width:" + width);
	varx.oninput = oninput;

	return varx;
}

// builds "slider" input objects
function sliderBuilder(lab, obj, min, max, width, par, oninput) {
	let realname = "";
	if(obj != null)
		realname = lab + "-" + obj.name;
	else
		realname = lab;

	let labx = elemBuilder("label", lab + ":", par);
	labx.setAttribute("for", realname);

	let varx = elemBuilder("input", "", par);
	varx.setAttribute("class", "object-elem slider")
	varx.setAttribute("id", realname);
	varx.setAttribute("name", realname);
	varx.setAttribute("min", min);
	varx.setAttribute("max", max);
	varx.setAttribute("step", (max - min) / 40);
	varx.setAttribute("type", "range");
	varx.setAttribute("style", "max-width:" + width);
	varx.oninput = oninput;

	return varx;
}