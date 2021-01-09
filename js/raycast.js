const TILE_SIZE = 64;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

const FOV_ANGLE = 60 * (Math.PI / 180);

const WALL_STRIP_WIDTH = 1;
const NUM_RAYS = WINDOW_WIDTH / WALL_STRIP_WIDTH;

const MINIMAP_SCALE_FACTOR = 0.2;

class Map
{
	constructor()
	{
		this.grid = [
			[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
			[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
			[1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
			[1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
			[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
		];
	}

	hasWallAt(x, y)
	{
		if ((x < 0 || WINDOW_WIDTH < x) || (y < 0 || WINDOW_HEIGHT < y))
			return (true);
		let mapGridIndexX = Math.floor(x / TILE_SIZE);
		let mapGridIndexY = Math.floor(y / TILE_SIZE);
		return (this.grid[mapGridIndexY][mapGridIndexX] != 0);
	}

	render()
	{
		for (let i = 0; i < MAP_NUM_ROWS; i++)
		{
			for (let j = 0; j < MAP_NUM_COLS; j++)
			{
				let tileX = j * TILE_SIZE;
				let tileY = i * TILE_SIZE;
				var tileColor = (this.grid[i][j] == 1 ? '#222' : '#fff');
				stroke('#222');
				fill(tileColor);
				rect(
					tileX * MINIMAP_SCALE_FACTOR,
					tileY * MINIMAP_SCALE_FACTOR,
					TILE_SIZE * MINIMAP_SCALE_FACTOR,
					TILE_SIZE * MINIMAP_SCALE_FACTOR
				);
			}
		}
	}
}

class Player
{
	constructor()
	{
		this.x = WINDOW_WIDTH / 2;
		this.y = WINDOW_HEIGHT / 2;
		this.radius = 3;
		this.turnDirection = 0;
		this.walkDirection = 0;
		this.rotationAngle = Math.PI / 2;
		this.moveSpeed = 2.0;
		this.rotationSpeed = 1.5 * (Math.PI / 180);
	}

	update()
	{
		this.rotationAngle += this.turnDirection * this.rotationSpeed;

		let moveStep = this.walkDirection * this.moveSpeed;
		let newPlayerX = this.x + moveStep * Math.cos(this.rotationAngle);
		let newPlayerY = this.y + moveStep * Math.sin(this.rotationAngle);

		if (!grid.hasWallAt(newPlayerX, newPlayerY))
		{
			this.x = newPlayerX;
			this.y = newPlayerY;
		}
	}

	render()
	{
		noStroke();
		fill('red');
		circle(
			this.x * MINIMAP_SCALE_FACTOR,
			this.y * MINIMAP_SCALE_FACTOR,
			this.radius * MINIMAP_SCALE_FACTOR);
		stroke('blue');
		line(
			this.x * MINIMAP_SCALE_FACTOR,
			this.y * MINIMAP_SCALE_FACTOR,
			(this.x + Math.cos(this.rotationAngle) * TILE_SIZE) * MINIMAP_SCALE_FACTOR,
			(this.y + Math.sin(this.rotationAngle) * TILE_SIZE) * MINIMAP_SCALE_FACTOR
		);
	}
}

class Ray
{
	constructor(rayAngle)
	{
		this.rayAngle = normalizeAngle(rayAngle);
		this.wallHitX = 0;
		this.wallHitY = 0;
		this.distance = 0;
		this.wasHitVertical = false;

		this.isRayFacingDown = 0 < this.rayAngle && this.rayAngle < Math.PI;
		this.isRayFacingUp = !this.isRayFacingDown;

		this.isRayFacingRight = this.rayAngle < 0.5 * Math.PI || 1.5 * Math.PI < this.rayAngle;
		this.isRayFacingLeft = !this.isRayFacingRight;
	}

	cast()
	{
		let xintercept, yintercept;
		let xstep, ystep;

		
		// 水平方向との交差判定

		let foundHorzWallHit = false;
		let horzWallHitX = 0;
		let horzWallHitY = 0;

		yintercept = Math.floor(player.y / TILE_SIZE) * TILE_SIZE;
		yintercept += this.isRayFacingDown ? TILE_SIZE : 0;

		xintercept = player.x + (yintercept - player.y) / Math.tan(this.rayAngle);

		ystep = TILE_SIZE;
		ystep *= this.isRayFacingUp ? -1 : 1;

		xstep = TILE_SIZE / Math.tan(this.rayAngle);
		xstep *= (this.isRayFacingLeft && xstep > 0) ? -1 : 1;
		xstep *= (this.isRayFacingRight && xstep < 0) ? -1 : 1;

		let nextHorzTouchX = xintercept;
		let nextHorzTouchY = yintercept;

		while ((0 <= nextHorzTouchX && nextHorzTouchX <= WINDOW_WIDTH) && (0 <= nextHorzTouchY && nextHorzTouchY <= WINDOW_HEIGHT))
		{
			if (grid.hasWallAt(nextHorzTouchX, nextHorzTouchY - (this.isRayFacingUp ? 1 : 0)))
			{
				foundHorzWallHit = true;
				horzWallHitX = nextHorzTouchX;
				horzWallHitY = nextHorzTouchY;
				break ;
			}
			else
			{
				nextHorzTouchX += xstep;
				nextHorzTouchY += ystep;
			}
		}


		// 垂直方向との交差判定

		let foundVertWallHit = false;
		let vertWallHitX = 0;
		let vertWallHitY = 0;

		xintercept = Math.floor(player.x / TILE_SIZE) * TILE_SIZE;
		xintercept += this.isRayFacingRight ? TILE_SIZE : 0;

		yintercept = player.y + (xintercept - player.x) * Math.tan(this.rayAngle);

		xstep = TILE_SIZE;
		xstep *= this.isRayFacingLeft ? -1 : 1;

		ystep = TILE_SIZE * Math.tan(this.rayAngle);
		ystep *= (this.isRayFacingUp && ystep > 0) ? -1 : 1;
		ystep *= (this.isRayFacingDown && ystep < 0) ? -1 : 1;

		let nextVertTouchX = xintercept;
		let nextVertTouchY = yintercept;

		while ((0 <= nextVertTouchX && nextVertTouchX <= WINDOW_WIDTH) && (0 <= nextVertTouchY && nextVertTouchY <= WINDOW_HEIGHT))
		{
			if (grid.hasWallAt(nextVertTouchX - (this.isRayFacingLeft ? 1 : 0), nextVertTouchY))
			{
				foundVertWallHit = true;
				vertWallHitX = nextVertTouchX;
				vertWallHitY = nextVertTouchY;
				break ;
			}
			else
			{
				nextVertTouchX += xstep;
				nextVertTouchY += ystep;
			}
		}


		// 近い交差点はどちらか？

		let horzHitDistance = (foundHorzWallHit) ? distanceBetweenPoints(player.x, player.y, horzWallHitX, horzWallHitY) : Number.MAX_VALUE;
		let vertHitDistance = (foundVertWallHit) ? distanceBetweenPoints(player.x, player.y, vertWallHitX, vertWallHitY) : Number.MAX_VALUE;

		if (vertHitDistance < horzHitDistance)
		{
			this.wallHitX = vertWallHitX;
			this.wallHitY = vertWallHitY;
			this.distance = vertHitDistance;
			this.wasHitVertical = true;
		}
		else
		{
			this.wallHitX = horzWallHitX;
			this.wallHitY = horzWallHitY;
			this.distance = horzHitDistance;
			this.wasHitVertical = false;
		}
	}

	render()
	{
		stroke('rgba(255, 0, 0, 0.1)');
		line(
			player.x * MINIMAP_SCALE_FACTOR,
			player.y * MINIMAP_SCALE_FACTOR,
			this.wallHitX * MINIMAP_SCALE_FACTOR,
			this.wallHitY * MINIMAP_SCALE_FACTOR
		);
	}
}

let grid = new Map();
let player = new Player();
let rays = [];

function keyPressed()
{
	if (keyCode == UP_ARROW)
		player.walkDirection = 1;
	else if (keyCode == DOWN_ARROW)
		player.walkDirection = -1;
	else if (keyCode == RIGHT_ARROW)
		player.turnDirection = 1;
	else if (keyCode == LEFT_ARROW)
		player.turnDirection = -1;
}

function keyReleased()
{
	if (keyCode == UP_ARROW)
		player.walkDirection = 0;
	else if (keyCode == DOWN_ARROW)
		player.walkDirection = 0;
	else if (keyCode == RIGHT_ARROW)
		player.turnDirection = 0;
	else if (keyCode == LEFT_ARROW)
		player.turnDirection = 0;
}

function castAllRays()
{
	let rayAngle = player.rotationAngle - (FOV_ANGLE / 2);
	rays = [];

	for (let col = 0; col < NUM_RAYS; col++)
	{
		let ray = new Ray(rayAngle);
		ray.cast();
		rays.push(ray);

		rayAngle += FOV_ANGLE / NUM_RAYS;
	}
}

function render3DProjectedWalls()
{
	for (var i = 0; i < NUM_RAYS; i++)
	{
		let ray = rays[i];
		let correctWallDistance = ray.distance * Math.cos(ray.rayAngle - player.rotationAngle);
		let distanceProjectionPlane = (WINDOW_WIDTH / 2) / Math.tan(FOV_ANGLE / 2);

		let wallStripHeight = (TILE_SIZE / correctWallDistance) * distanceProjectionPlane;

		let alpha = 1.0;
		var color = ray.wasHitVertical ? 255 : 180;

		fill('rgba(' + color + ',' + color + ',' + color + ',' + alpha + ')');
		noStroke();
		rect(
			i * WALL_STRIP_WIDTH,
			(WINDOW_HEIGHT / 2) - (wallStripHeight / 2),
			WALL_STRIP_WIDTH,
			wallStripHeight
		);
	}
}

function normalizeAngle(angle)
{
	angle = angle % (2 * Math.PI);
	if (angle < 0)
	{
		angle += 2 * Math.PI;
	}
	return (angle);
}

function distanceBetweenPoints(x1, y1, x2, y2)
{
	return (Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)));
}

function setup()
{
	createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
}

function update()
{
	player.update();
	castAllRays();
}

function draw()
{
	clear('#212121');
	update();

	render3DProjectedWalls();

	grid.render();
	for (ray of rays)
	{
		ray.render();
	}
	player.render();
}
