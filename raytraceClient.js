let canvas,ctx,canvasWidth,canvasHeight,id,pixels;
const BACKGROUND_COLOR = new Color(47, 15, 93);
let objects=[];
let AUTO_UPDATE=true;
let ANTI_ALIAS=false;
let ANTI_ALIAS_NUM_RAYS=4;
let camera_center=new Vector(0,0,0);
let fov=60;
let up=new Vector(0,0,1);
let look_direction=new Vector(1,0,0);
let camera_rotation=0;
let PIXEL_SIZE=3;
let DEFAULT_HSL=0.25;
let SHADOWS=true;
let SMOOTH_SHADING=false;
let STEP=0.2;



function toggleOption(){
	ANTI_ALIAS=document.getElementById("toggleAntiAlias").checked;
	AUTO_UPDATE=document.getElementById("toggleAutoUpdate").checked;
	ANTI_ALIAS_NUM_RAYS=document.getElementById("toggleAntiAliasNumber").value;
	PIXEL_SIZE=document.getElementById("togglePixelDensity").value;
	SHADOWS=document.getElementById("toggleShadows").checked;
	SMOOTH_SHADING=document.getElementById("toggleSmoothShading").checked;

	if(SMOOTH_SHADING)
		objects.forEach(obj => obj.updateTris());

	if(AUTO_UPDATE)
		updateCanvas();
}


class Light{
	constructor(id){
		this.intensity=1; // 0<=intensity<=1
		this.id=id;
		this.pos=camera_center.add(look_direction.normalize());
		this.name = "Light"+id;
		this.active=true;
	}
	toString(){
		return `${this.name}: Intensity=${this.intensity}; Pos=${this.pos}`;
	}
	updateTris(){}
}



class Obj{
	constructor(id){
		this.color=hslToRGB(0,1,DEFAULT_HSL);
		this.mirror=0; //0<=mirror<=1
		this.id=id;
		this.name="Object"+id
		//this.pos=new Vector(0,0,0);
		this.pos = camera_center.add(look_direction.normalize().scale(5));
		this.rotation=new Vector(0,0,0);
		this.size=1;
		this.kind="Sphere";
		this.active=true;

		this.file=cube;
		this.tris=[];
		this.updateTris();
	}
	setKind(kind){
		this.kind=kind;
		if(kind=="Bunny"){
			this.file=bunny;
		}else if(kind=="Cube"){
			this.file=cube;
		}else if(kind=="Icosahedron"){
			this.file=icos;
		}else if(kind=="Dodecahedron"){
			this.file=dodec;
		}
		else if(kind=="Star"){
			this.file=star;
		}
		
	}

	updateTris(){
		if(this.kind=="Sphere"){
			this.tris=[];
			return;
		}

		let scalingFactor=1;
		let shiftingFactor=new Vector(0,0,0);
		if(this.kind=="Bunny"){
			scalingFactor=0.03;
			shiftingFactor=new Vector(0,0,-1.5);
		}else if(this.kind=="Cube"){
			scalingFactor=0.7;
		}else if(this.kind=="Star"){
			scalingFactor=0.04;
		}
		scalingFactor*=this.size;

		let rotmat=new RotMatrix(this.rotation.x,this.rotation.y,this.rotation.z);

		let map=new Map();
		let tris=[];
		for(let i=0;i<this.file.vertexPositionIndices.length;i+=4){
			let fs=this.file.vertexPositionIndices;
			let ls=this.file.vertexPositions;

			let i1=fs[i];
			let i2=fs[i+1];
			let i3=fs[i+2];

			

			let v1=new Vector(ls[3*i1],ls[3*i1+1],ls[3*i1+2])
				.scale(scalingFactor)
				.add(shiftingFactor);
			let v2=new Vector(ls[3*i2],ls[3*i2+1],ls[3*i2+2])
				.scale(scalingFactor)
				.add(shiftingFactor);
			let v3=new Vector(ls[3*i3],ls[3*i3+1],ls[3*i3+2])
				.scale(scalingFactor)
				.add(shiftingFactor);

			v1=rotmat.multiply(v1);
			v2=rotmat.multiply(v2);
			v3=rotmat.multiply(v3);
			let tri=new Triangle(v1,v2,v3,i1,i2,i3);

			if(!map.has(i1))
				map.set(i1,[tri.n]);
			else
				map.get(i1).push(tri.n);
			if(!map.has(i2))
				map.set(i2,[tri.n]);
			else
				map.get(i2).push(tri.n);
			if(!map.has(i3))
				map.set(i3,[tri.n]);
			else
				map.get(i3).push(tri.n);

			tris.push(tri);
		};

		if(SMOOTH_SHADING){
			let newMap=new Map();
			for(const [k,v] of map.entries()){
				let n=new Vector(0,0,0);
				//console.log(v);
				v.forEach(x => n=n.add(x));
				newMap.set(k,n.normalize());
			};

			tris.forEach(function(tri){
				tri.v1n=newMap.get(tri.i1);
				tri.v2n=newMap.get(tri.i2);
				tri.v3n=newMap.get(tri.i3);

				
			})
		}

		this.tris=tris;
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
	
	let x0=inputBuilder("x",obj,"20%",pos,function(){
		obj.pos.x=this.value;
		console.log("Updated "+obj);
		if(AUTO_UPDATE)
			updateCanvas();

	});
	let y0=inputBuilder("y",obj,"20%",pos,function(){
		obj.pos.y=this.value;
		console.log("Updated "+obj);
		if(AUTO_UPDATE)
			updateCanvas();
	});
	let z0=inputBuilder("z",obj,"20%",pos,function(){
		obj.pos.z=this.value;
		console.log("Updated "+obj);
		if(AUTO_UPDATE)
			updateCanvas();
	});/*

	let x0=sliderBuilder("x",obj,-10,10,"20%",pos,function(){
		obj.pos.x=this.value;
		console.log("Updated "+obj);
		if(AUTO_UPDATE)
			updateCanvas();
	});
	let y0=sliderBuilder("y",obj,-10,10,"20%",pos,function(){
		obj.pos.y=this.value;
		console.log("Updated "+obj);
		if(AUTO_UPDATE)
			updateCanvas();
	});
	let z0=sliderBuilder("z",obj,-10,10,"20%",pos,function(){
		obj.pos.z=this.value;
		console.log("Updated "+obj);
		if(AUTO_UPDATE)
			updateCanvas();
	});*/
	let i0=sliderBuilder("Intensity",obj,0,1,"40%",int,function(){
		obj.intensity=this.value;
		console.log("Updated "+obj);
		if(AUTO_UPDATE)
			updateCanvas();
	});

	x0.setAttribute("value",obj.pos.x);
	y0.setAttribute("value",obj.pos.y);
	z0.setAttribute("value",obj.pos.z);
	i0.setAttribute("value",obj.intensity);


	x0.setAttribute("step",STEP);
	y0.setAttribute("step",STEP);
	z0.setAttribute("step",STEP);


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

	document.getElementById("objects").prepend(div);
	if(AUTO_UPDATE)
		updateCanvas();

	return obj;
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
	let select=selectBuilder(["Sphere","Cube","Icosahedron","Dodecahedron","Star","Bunny"],title);
	select.onchange=function(){
		obj.setKind(this.value);
		obj.updateTris();
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
		obj.color=hslToRGB(this.value/360,1,DEFAULT_HSL);
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
	col2.setAttribute("value",obj.mirror);

	let x0=inputBuilder("x",obj,"20%",pos,function(){
		obj.pos.x=this.value;
		console.log("Updated "+obj);
		if(AUTO_UPDATE)
			updateCanvas();

	});
	let y0=inputBuilder("y",obj,"20%",pos,function(){
		obj.pos.y=this.value;
		console.log("Updated "+obj);
		if(AUTO_UPDATE)
			updateCanvas();
	});
	let z0=inputBuilder("z",obj,"20%",pos,function(){
		obj.pos.z=this.value;
		console.log("Updated "+obj);
		if(AUTO_UPDATE)
			updateCanvas();
	});
	sliderBuilder("Rotation x",obj,0,360,"40%",int1,function(){
		obj.rotation.x=this.value;
		obj.updateTris();
		console.log("Updated "+obj);
		if(AUTO_UPDATE)
			updateCanvas();
	}).setAttribute("value",obj.rotation.x);
	sliderBuilder("Rotation y",obj,0,360,"40%",int2,function(){
		obj.rotation.y=this.value;
		obj.updateTris();
		console.log("Updated "+obj);
		if(AUTO_UPDATE)
			updateCanvas();
	}).setAttribute("value",obj.rotation.y);
	sliderBuilder("Rotation z",obj,0,360,"40%",int3,function(){
		obj.rotation.z=this.value;
		obj.updateTris();
		console.log("Updated "+obj);
		if(AUTO_UPDATE)
			updateCanvas();
	}).setAttribute("value",obj.rotation.z);
	let s=inputBuilder("Size",obj,"20%",size,function(){
		obj.size=this.value;
		obj.updateTris();
		console.log("Updated "+obj);
		if(AUTO_UPDATE)
			updateCanvas();
	});


	x0.setAttribute("step",STEP);
	y0.setAttribute("step",STEP);
	z0.setAttribute("step",STEP);
	s.setAttribute("step",STEP);
	s.setAttribute("min",0);

	x0.setAttribute("value",obj.pos.x);
	y0.setAttribute("value",obj.pos.y);
	z0.setAttribute("value",obj.pos.z);
	z0.setAttribute("value",obj.size);



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


	document.getElementById("objects").prepend(div);
	if(AUTO_UPDATE)
		updateCanvas();

	return obj;
}

function clearObjects(){
	objects=[];
	document.getElementById("objects").innerHTML="";
	if(AUTO_UPDATE)
		updateCanvas();
}




function getColor(ray,goodobjects,goodlights,numReflections=8){
	let minTime=Number.MAX_VALUE;
	let minObject=null;
	let minNormal=new Vector(0,0,0);
	//console.log(ray);
	//console.log(goodobjects);

	for(let i=0;i<goodobjects.length;i++){
		let obj=goodobjects[i];
		let intersect=ray.timeToIntersection(obj);
		let t=intersect.t;
		//console.log(intersect);
		if(0<t && t<minTime){
			minTime=t;
			minObject=obj;
			minNormal=intersect.n;
		}
	}

	if(minObject==null){
		return BACKGROUND_COLOR.randVariant(15);
	}

	let ambient=minObject.color;
	let diffuse=new Color(0,0,0);
	let specular=new Color(0,0,0);
	let point=ray.getVec(minTime);

	a:for(let i=0;i<goodlights.length;i++){
		let light=goodlights[i];
		let l=point.sub(light.pos).normalize()

		if(SHADOWS){
			let checkDir=light.pos.sub(point); // reflected light source
			let checkPos=point.add(checkDir.scale(0.001));
			let isHit=false;
			for(let j=0;j<goodobjects.length;j++){
				let obj=goodobjects[j];

				if(obj==minObject)
					continue;

				let check=new Ray(checkPos,checkDir).timeToIntersection(obj);
				if(check.t>0&&check.t<1){
					isHit=true;
					//console.log("bad")
					//console.log(check)
					break a;
				}
			}

		}
		

		let n=minNormal;
		let r=n.scale(2*l.dot(n)).sub(l).normalize();//https://janhalozan.com/2017/08/12/phong-shader/
		let v=ray.dir.negate().normalize();

		let diffuseDot=l.dot(n);
		if(diffuseDot<0){
			diffuse=diffuse.add(new Color(-100*light.intensity*diffuseDot));
		}

		let specularDot=r.dot(v);
		if(specularDot<0)
			specular=specular.add(new Color(-150*light.intensity*Math.pow(specularDot,7)));
	}

	let color=ambient.add(diffuse).add(specular);

	if(numReflections==0 || minObject.mirror==0)
		return color;

	//https://math.stackexchange.com/a/13263
	let newDir=ray.dir.sub(minNormal.scale(2*ray.dir.dot(minNormal))).normalize(); // reflected light source
	let newPos=point.add(newDir.scale(0.001));
	let newRay=new Ray(newPos,newDir)
	let reflected=getColor(newRay,goodobjects,goodlights,numReflections-1);

	return color.scale(1-minObject.mirror).add(reflected.scale(minObject.mirror));
	// (1-mirror)color+(mirror)reflected 
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
	
	let numRays = ANTI_ALIAS?ANTI_ALIAS_NUM_RAYS:1;
	let totalCount=Math.ceil(canvasWidth*canvasHeight/(PIXEL_SIZE*PIXEL_SIZE)*numRays);
	let count=0;
	for(let x=0;x<canvasWidth;x++){
		for(let y=0;y<canvasHeight;y++){

				if(x%PIXEL_SIZE==0 && y%PIXEL_SIZE==0){
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
					//if(x==canvasWidth/2&&y==canvasHeight/2)
					//	getColor(ray,goodobjects,goodlights);
					colors.push(getColor(ray,goodobjects,goodlights));

					count++;
					if(count%1000==0)
						console.log(`   ${count/1000} of ${Math.floor(totalCount/1000)}`);
				}

				let color=Color.average(colors);

				let off = (y * id.width + x) * 4;
				pixels[off] = color.r;
				pixels[off + 1] = color.g;
				pixels[off + 2] = color.b;
			}else{
				let off = (y * id.width + x) * 4;
				let old = ((y-(y%PIXEL_SIZE)) * id.width + x - (x%PIXEL_SIZE)) * 4;
				pixels[off] = pixels[old];
				pixels[off + 1] = pixels[old+1];
				pixels[off + 2] = pixels[old+2];
			}
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

}


document.getElementById("toggleAutoUpdate").checked=AUTO_UPDATE;
document.getElementById("toggleAntiAlias").checked=ANTI_ALIAS;
document.getElementById("togglePixelDensity").value=PIXEL_SIZE;
document.getElementById("toggleAntiAliasNumber").value=ANTI_ALIAS_NUM_RAYS;
document.getElementById("toggleShadows").checked=SHADOWS;
document.getElementById("toggleSmoothShading").checked=SMOOTH_SHADING;

let i0=sliderBuilder("Camera Rotation",null,-180,180,"80%",document.getElementById("div-for-rotation"),function(){
	camera_rotation=this.value;
	let angle=-camera_rotation*Math.PI/180;
	look_direction=new Vector(Math.cos(angle),Math.sin(angle),0);
	console.log("Updated "+camera_rotation);
	if(AUTO_UPDATE)
		updateCanvas();
}).setAttribute("value",camera_rotation);



initCanvas();



let obj1=addObject();
let obj2=addObject();
let obj3=addObject();
let l1=addLight();

obj1.pos=new Vector(5,0.4,1);
obj1.size=1;
obj1.mirror=0.5;
obj1.color=hslToRGB(200/360,1,DEFAULT_HSL);

obj2.pos=new Vector(4,-1,0);
obj2.size=0.5;
obj2.mirror=0;
obj2.color=hslToRGB(100/360,1,DEFAULT_HSL);


obj3.pos=new Vector(4,1.4,-1.6);
obj3.size=1.8;
obj3.mirror=0.1;
obj3.color=hslToRGB(300/360,1,DEFAULT_HSL);

l1.pos=new Vector(1,1,3);



document.getElementById("x-Object0").setAttribute("value",obj1.pos.x);
document.getElementById("y-Object0").setAttribute("value",obj1.pos.y);
document.getElementById("z-Object0").setAttribute("value",obj1.pos.z);
document.getElementById("Size-Object0").setAttribute("value",obj1.size);
document.getElementById("Reflectance-Object0").setAttribute("value",obj1.mirror);
document.getElementById("Color-Object0").setAttribute("value",200);

document.getElementById("x-Object1").setAttribute("value",obj2.pos.x);
document.getElementById("y-Object1").setAttribute("value",obj2.pos.y);
document.getElementById("z-Object1").setAttribute("value",obj2.pos.z);
document.getElementById("Size-Object1").setAttribute("value",obj2.size);
document.getElementById("Reflectance-Object1").setAttribute("value",obj2.mirror);
document.getElementById("Color-Object1").setAttribute("value",100);

document.getElementById("x-Object2").setAttribute("value",obj3.pos.x);
document.getElementById("y-Object2").setAttribute("value",obj3.pos.y);
document.getElementById("z-Object2").setAttribute("value",obj3.pos.z);
document.getElementById("Size-Object2").setAttribute("value",obj3.size);
document.getElementById("Reflectance-Object2").setAttribute("value",obj3.mirror);
document.getElementById("Color-Object2").setAttribute("value",300);

document.getElementById("x-Light3").setAttribute("value",l1.pos.x);
document.getElementById("y-Light3").setAttribute("value",l1.pos.y);
document.getElementById("z-Light3").setAttribute("value",l1.pos.z);


updateCanvas();