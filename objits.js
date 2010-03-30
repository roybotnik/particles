Particle = function (config) {
	this.color = config.color || "rgb(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ")";
	this.y = config.y || 0;
	this.x = config.x || 0;
	this.vX = config.vX || 0;
	this.vY = config.vY || 0;
	this.size  = config.size || 0; 
};

Particle.prototype = {
	avgVX : function () {
		return Math.abs(this.vX);
	},
	avgVY : function () {
		return Math.abs(this.vY);
	},
	avgV : function () {
		return (this.avgVX() + this.avgVY()) * .5;
	},
	getDistanceAndTrig : function (otherX, otherY) {
		var dX = this.x - otherX;
		var dY = this.y - otherY; 
		var d = Math.sqrt(dX * dX + dY * dY);
		var a = Math.atan2(dY, dX);
		var cosA = Math.cos(a);
		var sinA = Math.sin(a);

		return {
			"dX" : dX,
			"dY" : dY,
			"d" : d,
			"a" : a,
			"cosA" : cosA,
			"sinA" : sinA
		};	
	}
};

Mouse = function() {
	this.x = 0;
	this.y = 0;
	this.prevX = 0;
	this.prevY = 0;
	this.isDown = 0;
};

Mouse.prototype = {
	vX : function () {
		return this.x - this.prevX;
	},
	vY : function () {
		return this.y - this.prevY;
	},
	updatePrevCoords : function () {
		this.prevX = this.x;
		this.prevY = this.y;
	}
};

World = function (config) {
	this.height = config.height;
	this.width = config.width;

	// toggles
	this.enableGravity = config.enableGravity || false;
	this.enableStir = config.enableStir || true;
	this.enableFriction = config.enableFriction || true;
	this.enableBlast = config.enableBlast || false;
	this.enableAttraction = config.enableAttraction || false;
	this.enableDrift = config.enableDrift || false;
	this.enableZoom = config.enableZoom || false;

	this.entities = [];

	// physics constants
	this.friction = .96;
	this.gravity = .8;
	
	// distance to be affected by cursor
	this.maxDistance = this.width / 1.15;

	// how close particles have to be to be affected by stir
	this.stirDistance = this.width / 16;

	// blast radius distance
	this.blastDistance = this.width / 2;
	
	this.mouse = new Mouse();
};

World.prototype = {
	applyMouseBlast : function (particle) {
		if(this.enableBlast && this.mouse.isDown) {
			var geometry = particle.getDistanceAndTrig(this.mouse.x, this.mouse.y);

			if(geometry.d < this.blastDistance) {
				var blowAcc = (1 - (geometry.d / this.blastDistance)) * 14;
				particle.vX += geometry.cosA * blowAcc + .5 - Math.random();
				particle.vY += geometry.sinA * blowAcc + .5 - Math.random();
			}
		}
	},
	applyMouseAttraction : function (particle) {
		var geometry = particle.getDistanceAndTrig(this.mouse.x, this.mouse.y);

		if(this.enableAttraction && geometry.d < this.maxDistance) {
			var toAcc = (1 - (geometry.d / this.maxDistance)) * world.width * .0014;
			particle.vX -= geometry.cosA * toAcc;
			particle.vY -= geometry.sinA * toAcc;
		}
	},
	applyMouseStir : function (particle) {
		var geometry = particle.getDistanceAndTrig(this.mouse.x, this.mouse.y);
		if (this.enableStir && geometry.d < this.stirDistance) {
			var mAcc = (1 - (geometry.d / this.stirDistance)) * this.width * .00022;
			particle.vX += this.mouse.vX() * mAcc;
			particle.vY += this.mouse.vY() * mAcc;	
		}
	}
};
