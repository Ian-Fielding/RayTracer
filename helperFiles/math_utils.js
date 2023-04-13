class Vector{
	constructor(x,y,z){
		this.x=x;
		this.y=y;
		this.z=z;
	}
	toString(){
		return `(${this.x},${this.y},${this.z})`;
	}
	copy(){
		return new Vector(this.x,this.y,this.z);
	}


	getMagnitude(){
		return Math.sqrt((this.x*this.x)+(this.y*this.y)+(this.z*this.z));
	}
	normalize(){
		let len=this.getMagnitude();
		return new Vector(this.x/len,this.y/len,this.z/len);
	}

	dot(other){
		return (this.x*other.x)+(this.y*other.y)+(this.z*other.z);
	}

	add(other){
		return new Vector((this.x+other.x),(this.y+other.y),(this.z+other.z));
	}
	sub(other){
		return new Vector((this.x-other.x),(this.y-other.y),(this.z-other.z));
	}
	scale(a){
		return new Vector(a*this.x,a*this.y,a*this.z);
	}



	cross(other){ 
		return new Vector(this.y*other.z-this.z*other.y,this.z*other.x-this.x*other.z,this.x*other.y-this.y*other.x);
	}


}


class Ray{
	constructor(pos,dir){
		this.pos=pos;
		this.dir=dir;

		// set of pos+t*dir for all t in [0,infty)
	}

	getVec(t){
		return this.dir.scale(t).add(this.pos);
	}

	toString(){
		return `{${this.pos} + t${this.dir}}`;
	}

	timeToIntersection(obj){ 
		switch(obj.kind){
		case "Sphere":
			let p=this.pos;
			let d=this.dir;
			let c=obj.pos;
			let r=obj.size;

			let A=d.dot(d);
			let B=d.dot(p.sub(c));
			let C=(p.sub(c)).dot(p.sub(c))-r*r;

			let det=B*B-A*C;
			if(det<0)
				return -1;

			let t0=(-B+Math.sqrt(det))/(A);
			let t1=(-B-Math.sqrt(det))/(A);
			let t=0;
			if(t0<0&&t1<0)
				t = -1;
			else if(t0<0)
				t = t1;
			else if(t1<0)
				t =  t0;
			else 
				t = Math.min(t0,t1);

			return {t: t,n: this.getVec(t).sub(c).normalize()};
		}
	}
}