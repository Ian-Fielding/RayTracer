/* 	color.js

	This file contains the Color class as well as helper methods for computing
	the color of objects
*/


class Color {
	constructor(r, g, b) {
		if(g == null) { // if no second parameter, set to uniform color
			this.r = r;
			this.g = r;
			this.b = r;
		} else { // otherwise sets rgb values
			this.r = this.clamp(r);
			this.g = this.clamp(g);
			this.b = this.clamp(b);
		}
	}

	// returns the "clamp" of x
	clamp(x) {
		if(x < 0)
			return 0;
		if(x > 255)
			return 255;
		return Math.floor(x);
	}

	// adds c1 and c2 to this color linearly
	add(c1, c2) {
		if(c2 == null)
			c2 = new Color(0);
		return new Color(this.r + c1.r + c2.r, this.g + c1.g + c2.g, this
			.b + c1.b + c2.b);
	}

	// scales this color by a
	scale(a) {
		return new Color(a * this.r, a * this.g, a * this.b);
	}

	// given a list of colors, returns the average of each color
	static average(colors) {
		let ar = 0;
		let ag = 0;
		let ab = 0;
		for(let i = 0; i < colors.length; i++) {
			ar += colors[i].r;
			ag += colors[i].g;
			ab += colors[i].b;
		}
		return new Color(ar / colors.length, ag / colors.length, ab / colors
			.length);
	}

	// conversts hsl to rgb
	// apapted from https://stackoverflow.com/a/9493060
	static hslToRGB(h, s, l) {
		var r, g, b;

		if(s == 0) {
			r = g = b = l; // achromatic
		} else {
			var hue2rgb = function hue2rgb(p, q, t) {
				if(t < 0) t += 1;
				if(t > 1) t -= 1;
				if(t < 1 / 6) return p + (q - p) * 6 * t;
				if(t < 1 / 2) return q;
				if(t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
				return p;
			}

			var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			var p = 2 * l - q;
			r = hue2rgb(p, q, h + 1 / 3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1 / 3);
		}

		return new Color(Math.round(r * 255), Math.round(g * 255), Math
			.round(b * 255));
	}

	toString() {
		return `(${this.r},${this.g},${this.b})`;
	}

	// returns a random color close to this one
	// returns a closer color if n is smaller
	randVariant(n) {
		let i1 = (n * Math.random()) / 2;
		let i2 = (n * Math.random()) / 2;
		let i3 = (n * Math.random()) / 2;
		return new Color(this.r + i1, this.g + i2, this.b + i3);
	}
}

const BACKGROUND_COLOR = new Color(47, 15, 93);
const DEFAULT_HSL = 0.25;