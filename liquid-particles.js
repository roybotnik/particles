var canvas;
var ctx;
var canvasDiv;
var outerDiv;

var radCirc = Math.PI * 2;

var mouse = {
	"x" : null,
	"y" : null,
	"vX" : null,
	"vY" : null,
	"prevX" : 0,
	"prevY" : 0,
	"isDown" : false
};

var world = {
	"enableGravity" : false,
	"enableStir" : true,
	"enableFriction" : true,
	"enableBlast" : false,
	"enableAttraction" : false,
	"enableDrift" : false,
	"enableZoom" : false,
	"entities" : [],
	"friction" : .96,
	"gravity" : .8,
	"height" : 560,
	"width" : 1000
}

var world2 = new World(1000, 560);

init = function () {
	canvas = document.getElementById("mainCanvas");
	outerDiv = document.getElementById("outer");
	canvasDiv = document.getElementById("canvasContainer");
	ctx = canvas.getContext("2d");

	createParticles(500);

	attachEvents();

	setInterval(processParticles, 16.6);
}

createParticles = function (amount) {
	var i = amount;
	while(i--) {
		world.entities.push(spawnMovingParticle(world.width * .5, world.height * .5));
	}
}

spawnMovingParticle = function (x, y) {
	var particle = new Particle({ "x" : x,
			"y" : y,
			"vX" : Math.random() * 15 - 8,
			"vY" : Math.random() * 15 - 8,
			"size" : 5 });
	return particle;
}	

attachEvents = function () {
	document.onmousedown = onDocMouseDown;
	document.onmouseup = onDocMouseUp;
	document.onmousemove = onDocMouseMove;
}

processParticles = function () {
	// clear canvas
	ctx.clearRect(0, 0, world.width, world.height);

	ctx.globalCompositeOperation = "lighter";

	// Get mouse velocity
	vX = world2.mouse.vX();
	vY = world2.mouse.vY();
	world2.mouse.updatePrevCoords();

	// distance to cursor
	var toDist = world.width / 1.15;

	// how close particles have to be to be affected by stir
	var stirDist = world.width / 16;

	// blast radius distance
	var blowDist = world.width / 2;

	var i = world.entities.length - 1;
	if (i > 0) {
		while(i--) {
			var particle = world.entities[i];

			// cursor distance
			var dX = particle.x - mouse.x;
			var dY = particle.y - mouse.y; 
			var d = Math.sqrt(dX * dX + dY * dY);

			var a = Math.atan2(dY , dX);
			var cosA = Math.cos(a);
			var sinA = Math.sin(a);

			// Mouse blast
			if(world.enableBlast && mouse.isDown) {
				if(d < blowDist) {
					var blowAcc = (1 - (d / blowDist)) * 14;
					particle.vX += cosA * blowAcc + .5 - Math.random();
					particle.vY += sinA * blowAcc + .5 - Math.random();
				}
			}

			// Mouse attraction
			if(world.enableAttraction && d < toDist) {
				var toAcc = (1 - (d / toDist)) * world.width * .0014;
				particle.vX -= cosA * toAcc;
				particle.vY -= sinA * toAcc;
			}

			// Mouse stir
			if(world.enableStir && d < stirDist) {
				var mAcc = (1 - (d / stirDist)) * world.width * .00022;
				particle.vX += vX * mAcc;
				particle.vY += vY * mAcc;			
			}

			// Pull of gravity
			if (world.enableGravity) {
				particle.vY += world.gravity;
			}

			// Friction
			if (world.enableFriction) {
				particle.vX *= world.friction;
				particle.vY *= world.friction;
			}

			// Drift
			if (world.enableDrift) {
				var avgVX = Math.abs(particle.vX);
				var avgVY = Math.abs(particle.vY);
				var avgV = (avgVX + avgVY) * .5;

				if (avgVX < .1) {
					particle.vX *= Math.random() * 3;
				}
				if (avgVY < .1) {
					particle.vY *= Math.random() * 3;
				}
			}

			// Size adjustment
			if (world.enableZoom) {
				var sc = avgV * .45;
				sc = Math.max(Math.min(sc , 3.5), .4);
			}
			else {
				var sc = particle.size;
			}

			var nextX = particle.x + particle.vX;
			var nextY = particle.y + particle.vY;

			if(nextX > world.width) {
				nextX = world.width;
				particle.vX *= -1;
			}
			else if(nextX < 0) {
				nextX = 0;
				particle.vX *= -1;
			}

			if(nextY > world.height) {
				nextY = world.height;
				particle.vY *= -1;
			}
			else if(nextY < 0) {
				nextY = 0;
				particle.vY *= -1;
			}

			particle.x = nextX;
			particle.y = nextY;

			ctx.fillStyle = particle.color;
			ctx.beginPath();
			ctx.arc(particle.x, particle.y, sc, 0, radCirc, true);
			ctx.closePath();
			ctx.fill();
		}
	}

	if (mouse.isDown) {
		world.entities.push(spawnMovingParticle(mouse.x, mouse.y));
	}
}

onDocMouseMove = function (e) {
	var ev = e ? e : window.event;
	mouse.x = ev.clientX - outerDiv.offsetLeft - canvasDiv.offsetLeft;
	mouse.y = ev.clientY - outerDiv.offsetTop  - canvasDiv.offsetTop;
	world2.mouse.x = ev.clientX - outerDiv.offsetLeft - canvasDiv.offsetLeft;
	world2.mouse.y = ev.clientY - outerDiv.offsetTop  - canvasDiv.offsetTop;
}

onDocMouseDown = function (e) {
	mouse.isDown = true;
	return false;
}

onDocMouseUp = function (e) {
	mouse.isDown = false;
	return false;
}
