let canvas,ctx,canvasWidth,canvasHeight,id,pixels;
const BACKGROUND_COLOR = new Color(47, 15, 93);
let objects=[];
let AUTO_UPDATE=true;
let ANTI_ALIAS=false;
let ANTI_ALIAS_NUM_RAYS=8;
let camera_center=new Vector(-1,0,0);
let fov=60;
let up=new Vector(0,0,1);
let look_direction=new Vector(1,0,0);






function toggleAutoUpdate(){
	AUTO_UPDATE=document.getElementById("toggleAutoUpdate").checked;
	if(AUTO_UPDATE){
		updateCanvas();
	}else{

	}

}


function toggleAntiAlias(){
	ANTI_ALIAS=document.getElementById("toggleAntiAlias").checked;
	if(AUTO_UPDATE)
		updateCanvas();
}


class Light{
	constructor(id){
		this.intensity=1; // 0<=intensity<=1
		this.id=id;
		this.pos=new Vector(0,0,0);
		this.name = "Light"+id;
		this.active=true;
	}
	toString(){
		return `${this.name}: Intensity=${this.intensity}; Pos=${this.pos}`;
	}
}



class Obj{
	constructor(id){
		this.color=new Color(255,0,0);
		this.mirror=0; //0<=mirror<=1
		this.id=id;
		this.name="Object"+id
		this.pos=new Vector(0,0,0);
		this.rotation=new Vector(0,0,0);
		this.size=1;
		this.kind="Sphere";
		this.active=true;
	}
	toString(){
		return `${this.name}: Kind=${this.kind}; Mirror=${this.mirror}; Color=${this.color}; Pos=${this.pos}; Rot=${this.rotation}; Size=${this.size}`;
	}
}



function addLight(){
	let obj=new Light(objects.length);
	objects.push(obj);
	let div=document.createElement("div");
	div.setAttribute("class","object");
	div.setAttribute("id",obj.name);
	
	let titleText = elemBuilder("p","Light",div);


	let pos = elemBuilder("div","",div);
	let int = elemBuilder("div","",div);

	inputBuilder("x",obj,"20%",pos,function(){
		obj.pos.x=this.value;
		console.log("Updated "+obj);
		if(AUTO_UPDATE)
			updateCanvas();

	});
	inputBuilder("y",obj,"20%",pos,function(){
		obj.pos.y=this.value;
		console.log("Updated "+obj);
		if(AUTO_UPDATE)
			updateCanvas();
	});
	inputBuilder("z",obj,"20%",pos,function(){
		obj.pos.z=this.value;
		console.log("Updated "+obj);
		if(AUTO_UPDATE)
			updateCanvas();
	});
	sliderBuilder("Intensity",obj,0,1,"40%",int,function(){
		obj.intensity=this.value;
		console.log("Updated "+obj);
		if(AUTO_UPDATE)
			updateCanvas();
	});

	let remove=elemBuilder("button","Remove",div);
	remove.setAttribute("class","mini-button removal");
	remove.setAttribute("id","r"+obj.name);
	remove.onclick=function(){
		let name = this.getAttribute("id").substring(1);
		let id = name.charAt(name.length-1)
		document.getElementById(name).remove();
		objects[id].active=false;

		console.log(`${objects[id].name} removed`);
		if(AUTO_UPDATE)
			updateCanvas();
	}

	document.getElementById("objects").appendChild(div);
	if(AUTO_UPDATE)
		updateCanvas();
}


function addObject(){
	let obj=new Obj(objects.length);
	console.log("Created a new object "+obj);
	objects.push(obj);
	let div=document.createElement("div");
	div.setAttribute("class","object");
	div.setAttribute("id",obj.name);
	
	let title=elemBuilder("div","",div)
	let titleText = elemBuilder("p","Object",title);
	let select=selectBuilder(["Sphere","Cube","Bunny"],title);
	select.onchange=function(){
		obj.kind=this.value;
		console.log("Updated "+obj);
		if(AUTO_UPDATE)
			updateCanvas();
	}

	div.appendChild(document.createElement("hr"));
	let col_row1 = elemBuilder("div","",div);
	let col_row2 = elemBuilder("div","",div);

	div.appendChild(document.createElement("hr"));
	let pos = elemBuilder("div","",div);

	let int1 = elemBuilder("div","",div);
	let int2 = elemBuilder("div","",div);
	let int3 = elemBuilder("div","",div);
	let size = elemBuilder("div","",div);

	let col1=sliderBuilder("Color",obj,0,360,"50%",col_row1,function(){
		obj.color=hslToRGB(this.value/360,1,0.1);
		console.log("Updated "+obj);
		if(AUTO_UPDATE)
			updateCanvas();
	});
	col1.setAttribute("class","rainbow");
	col1.setAttribute("value",0);

	let col2=sliderBuilder("Reflectance",obj,0,1,"50%",col_row2,function(){
		obj.mirror=this.value;
		console.log("Updated "+obj);
		if(AUTO_UPDATE)
			updateCanvas();
	});
	col2.setAttribute("value",0);

	inputBuilder("x",obj,"20%",pos,function(){
		obj.pos.x=this.value;
		console.log("Updated "+obj);
		if(AUTO_UPDATE)
			updateCanvas();

	});
	inputBuilder("y",obj,"20%",pos,function(){
		obj.pos.y=this.value;
		console.log("Updated "+obj);
		if(AUTO_UPDATE)
			updateCanvas();
	});
	inputBuilder("z",obj,"20%",pos,function(){
		obj.pos.z=this.value;
		console.log("Updated "+obj);
		if(AUTO_UPDATE)
			updateCanvas();
	});
	sliderBuilder("Rotation x",obj,0,360,"40%",int1,function(){
		obj.rotation.x=this.value;
		console.log("Updated "+obj);
		if(AUTO_UPDATE)
			updateCanvas();
	}).setAttribute("value",0);
	sliderBuilder("Rotation y",obj,0,360,"40%",int2,function(){
		obj.rotation.y=this.value;
		console.log("Updated "+obj);
		if(AUTO_UPDATE)
			updateCanvas();
	}).setAttribute("value",0);
	sliderBuilder("Rotation z",obj,0,360,"40%",int3,function(){
		obj.rotation.z=this.value;
		console.log("Updated "+obj);
		if(AUTO_UPDATE)
			updateCanvas();
	}).setAttribute("value",0);
	let s=inputBuilder("Size",obj,"20%",size,function(){
		obj.size=this.value;
		console.log("Updated "+obj);
		if(AUTO_UPDATE)
			updateCanvas();
	}).setAttribute("value",1);


	let remove=elemBuilder("button","Remove",div);
	remove.setAttribute("class","mini-button removal");
	remove.setAttribute("id","r"+obj.name);
	remove.onclick=function(){
		let name = this.getAttribute("id").substring(1);
		let id = name.charAt(name.length-1)
		document.getElementById(name).remove();
		objects[id].active=false;

		console.log(`${objects[id].name} removed`);
		if(AUTO_UPDATE)
			updateCanvas();
	}


	document.getElementById("objects").appendChild(div);
	if(AUTO_UPDATE)
		updateCanvas();
}

function clearObjects(){
	objects=[];
	document.getElementById("objects").innerHTML="";
	if(AUTO_UPDATE)
		updateCanvas();
}




function getColor(ray,goodobjects,goodlights){
	let minTime=Number.MAX_VALUE;
	let minObject=null;
	let minNormal=new Vector(0,0,0);

	for(let i=0;i<goodobjects.length;i++){
		let obj=goodobjects[i];
		let intersect=ray.timeToIntersection(obj);
		let t=intersect.t;
		if(0<t && t<minTime){
			minTime=t;
			minObject=obj;
			minNormal=intersect.n;
		}
	}

	if(minObject==null){
		return BACKGROUND_COLOR.randVariant(25);
	}

	let diffuse=minObject.color
	for(let i=0;i<goodlights.length;i++){
		let light=goodlights[i];

		let dot=(ray.getVec(minTime).sub(light.pos).normalize()).dot(minNormal);
		//console.log(`DOT   : ${-10*light.intensity*dot}`)
		if(dot<0){
			diffuse=diffuse.add(new Color(-100*light.intensity*dot));
		}
	}

	return diffuse;
}

function updateCanvas(){
	let goodobjects=objects.filter((obj) => obj.active && !(obj instanceof Light));
	let goodlights=objects.filter((obj) => obj.active && (obj instanceof Light));
	let w=2*Math.tan(fov*Math.PI/360);
	let h=w*canvasHeight/canvasWidth;

	let left=up.cross(look_direction).normalize();
	let right=left.scale(-1);
	let down=up.scale(-1);

	let startPoint=camera_center.add(look_direction).add(left.scale(w/2)).add(up.scale(h/2));

	console.log("START");
	let colors=[];
	for(let x=0;x<canvasWidth;x++){
		for(let y=0;y<canvasHeight;y++){
			let numRays = ANTI_ALIAS?ANTI_ALIAS_NUM_RAYS:1;
			colors=[];
			for(let i=0;i<numRays;i++){
				let pixel=startPoint.add(right.scale(x*w/canvasWidth)).add(down.scale(y*h/canvasHeight)).sub(camera_center);
				let dir=pixel;
				if(ANTI_ALIAS){
					let dx=w/canvasWidth;
					let dy=h/canvasHeight;
					let ax=(dx*Math.random())-(dx/2);
					let ay=(dy*Math.random())-(dy/2);
					dir=dir.add(right.scale(ax)).add(down.scale(ay));
				}

				let ray=new Ray(camera_center,dir);
				colors.push(getColor(ray,goodobjects,goodlights));
			}

			let color=Color.average(colors);

			let off = (y * id.width + x) * 4;
			pixels[off] = color.r;
			pixels[off + 1] = color.g;
			pixels[off + 2] = color.b;
			
		}
	}

	console.log("DONE")
	ctx.putImageData(id, 0, 0);
}


function initCanvas(){
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
	canvasWidth = canvas.width;
	canvasHeight = canvas.height;
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	id = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
	pixels = id.data;

	for(let x=0;x<canvasWidth;x++){
		for(let y=0;y<canvasHeight;y++){
			let off = (y * id.width + x) * 4;
			pixels[off + 3] = 255;
		}
	}

	updateCanvas();
}


initCanvas();
document.getElementById("toggleAutoUpdate").checked=AUTO_UPDATE;
document.getElementById("toggleAntiAlias").checked=ANTI_ALIAS;