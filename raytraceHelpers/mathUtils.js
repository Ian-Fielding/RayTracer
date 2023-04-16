/* 	mathUtils.js

	This file contains the Vector, Ray, RotMatrix and Triangle classes. Mostly
	contains helper functions for more complex math elsewhere
*/


// (x,y,z) representation of vector
class Vector {
	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
	toString() {
		return `(${this.x},${this.y},${this.z})`;
	}
	copy() {
		return new Vector(this.x, this.y, this.z);
	}

	// returns magnitude of vector
	getMagnitude() {
		return Math.sqrt((this.x * this.x) + (this.y * this.y) + (this.z *
			this.z));
	}

	// returns new normalized vector
	normalize() {
		let len = this.getMagnitude();
		return new Vector(this.x / len, this.y / len, this.z / len);
	}

	// returns dot product with other vector
	dot(other) {
		return (this.x * other.x) + (this.y * other.y) + (this.z * other.z);
	}

	// returns cross product with other vector
	cross(other) {
		return new Vector(this.y * other.z - this.z * other.y, this.z *
			other.x - this.x * other.z, this.x * other.y - this.y *
			other.x);
	}

	// adds this vector with another vector
	// note that JS sucks and all parameters need to be parsed to floats before
	// they can be added since it assumes string concatenation instead of addition
	add(other) {
		return new Vector(Number.parseFloat(this.x) + Number.parseFloat(
			other.x), Number.parseFloat(this.y) + Number.parseFloat(
			other.y), Number.parseFloat(this.z) + Number.parseFloat(
			other.z));
	}

	// subtracts another vector from this one
	sub(other) {
		return new Vector((this.x - other.x), (this.y - other.y), (this.z -
			other.z));
	}

	// scales this vector by a
	scale(a) {
		return new Vector(a * this.x, a * this.y, a * this.z);
	}

	// negates this vector
	negate() {
		return new Vector(-this.x, -this.y, -this.z);
	}

}


// class representing rotation matrix
class RotMatrix {
	constructor(gamma, beta, alpha) {
		alpha = alpha * Math.PI / 180; // rotation z
		beta = beta * Math.PI / 180; // rotation y
		gamma = gamma * Math.PI / 180; // rotation x
		let cos = Math.cos;
		let sin = Math.sin;

		// column vectors of the matrix
		this.v1 = new Vector(
			cos(alpha) * cos(beta),
			sin(alpha) * cos(beta),
			-sin(beta)
		);
		this.v2 = new Vector(
			cos(alpha) * sin(beta) * sin(gamma) - sin(alpha) * cos(
				gamma),
			sin(alpha) * sin(beta) * sin(gamma) + cos(alpha) * cos(
				gamma),
			cos(beta) * sin(gamma)
		);
		this.v3 = new Vector(
			cos(alpha) * sin(beta) * cos(gamma) + sin(alpha) * sin(
				gamma),
			sin(alpha) * sin(beta) * cos(gamma) - cos(alpha) * sin(
				gamma),
			cos(beta) * cos(gamma)
		);
	}

	// returns the vector after multiplying v to this matrix
	multiply(v) {
		return this.v1.scale(v.x).add(this.v2.scale(v.y)).add(this.v3.scale(
			v.z));
	}
}


// class representing triangle
class Triangle {
	constructor(v1, v2, v3, i1, i2, i3) {
		// vertices of triangle
		this.v1 = v1;
		this.v2 = v2;
		this.v3 = v3;

		// normal vector of triangle
		this.n = (this.v2.sub(this.v1)).cross(this.v3.sub(this.v1))
			.normalize();

		// indices & vertex normals for Phong interpolation
		this.i1 = i1;
		this.i2 = i2;
		this.i3 = i3;
		this.v1n = null;
		this.v2n = null;
		this.v3n = null;
	}


	// offsets this triangle by pos
	getOffset(pos) {
		let newTri = new Triangle(this.v1.add(pos), this.v2.add(pos), this
			.v3.add(pos), this.i1, this.i2, this.i3);
		newTri.v1n = this.v1n;
		newTri.v2n = this.v2n;
		newTri.v3n = this.v3n;

		return newTri;
	}

	toString() {
		return `Triangle\n   ${this.v1}\n   ${this.v2}\n   ${this.v3}`;
	}
}


// class representing a ray
class Ray {
	constructor(pos, dir) {
		this.pos = pos; // center of ray
		this.dir = dir; // direction of ray
	}

	// returns the vector of this ray at time t
	// i.e. returns pos + t*dir
	getVec(t) {
		return this.dir.scale(t).add(this.pos);
	}

	toString() {
		return `{${this.pos} + t${this.dir}}`;
	}

	// returns {time,normal} of this ray for hitting obj
	timeToIntersection(obj) {
		if(obj.kind == "Sphere")
			return timeToSphereIntersection(this, obj);

		return mt(this, obj);
	}
}