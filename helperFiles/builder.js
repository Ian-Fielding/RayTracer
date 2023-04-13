
function selectBuilder(values,par){
	let elem = elemBuilder("select","",par);
	for(let i=0;i<values.length;i++){
		let entry=elemBuilder("option",values[i],elem);
		entry.setAttribute("value",values[i]);
	}
	return elem;
}

function elemBuilder(name,innerHTML,par){
	let elem = document.createElement(name);
	elem.innerHTML = innerHTML;
	elem.setAttribute("class","object-elem");
	par.appendChild(elem);
	return elem;
}

function inputBuilder(lab,obj,width,par,oninput){
	let labx=elemBuilder("label",lab+":",par);
	labx.setAttribute("for",lab+"-"+obj.name);
	

	let varx=elemBuilder("input","",par);
	varx.setAttribute("class", "object-elem input");
	varx.setAttribute("id",lab+"-"+obj.name);
	varx.setAttribute("name",lab+"-"+obj.name);
	varx.setAttribute("type","number");
	varx.setAttribute("value",0);
	varx.setAttribute("style","max-width:"+width);
	varx.oninput=oninput;

	return varx;
}

function sliderBuilder(lab,obj,min,max,width,par,oninput){
	let labx=elemBuilder("label",lab+":",par);
	labx.setAttribute("for",lab+"-"+obj.name);

	let varx=elemBuilder("input","",par);
	varx.setAttribute("class", "object-elem slider")
	varx.setAttribute("id",lab+"-"+obj.name);
	varx.setAttribute("name",lab+"-"+obj.name);
	varx.setAttribute("min",min);
	varx.setAttribute("max",max);
	varx.setAttribute("step",(max-min)/40);
	varx.setAttribute("type","range");
	varx.setAttribute("value",max);
	varx.setAttribute("style","max-width:"+width);
	varx.oninput=oninput;

	return varx;
}
