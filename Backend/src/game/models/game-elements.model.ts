import { WIDTH, HEIGHT } from "../game.service";
import { MultiplayerService } from "../services/multiplayer.service";


export class Paddle{
	step!: number;

	height: number = 200;
	width: number = 25;
	randomWanted : boolean = false;

	x!: number;
	y!: number;

	score: number = 0;

    constructor(public side: number, private multiplayer: MultiplayerService)
	{
		if (side)
			this.x = WIDTH - this.width;
		else
			this.x = 0;
        this.reset()
	}

    reset()
	{
		this.y = HEIGHT / 2;
		this.score = 0;
		this.multiplayer.paddleReset(this)
	}
	updatePosition(y: number)
	{
		this.y = y
	}

}

export class Ball{

    x: number
    y: number
    angle: number = Math.random() * 360;
    speed: number;
    radius: number = 15;
	bottom = this.radius;
	top = HEIGHT - this.radius;
	left = this.radius;
	right = WIDTH - this.radius;


    constructor(private multiplayer: MultiplayerService){
		this.reset()
    }
	
    reset()
	{
		let random = 1
		if (this.multiplayer.random)
		{
			random += Math.random() % 10;
		}
		this.speed = 20 * random;
		this.x = WIDTH / 2;
		this.y = HEIGHT / 2;
		this.angle = Math.random() * 360;
		while((this.angle >= 75 && this.angle <= 105) || (this.angle >= 255 && this.angle <= 285) )//|| (this.angle >= 0 && this.angle <= 15)
			this.angle = Math.random() * 360;
	    this.multiplayer.previousBallState = {x: this.x, y : this.y, angle: this.angle}
		this.multiplayer.ballReset(this)

	}

	calculateReflectionAngle(ballY: number, paddleHeight: number, minAngle: number, maxAngle: number){
		const relativePosition = ballY / paddleHeight;
		const newAngle = minAngle + (maxAngle - minAngle) * relativePosition;
		return newAngle;
	}

	updateCollide(paddle: Paddle, y: number, x: number, playerColliding: number)
	{
		if (playerColliding == 1)
		{
			this.angle = this.calculateReflectionAngle(y - (paddle.y - paddle.height / 2), paddle.height, 225, 135);
			this.x = paddle.x + (-this.radius);

		}
		else
		{
			this.angle = this.calculateReflectionAngle(y - (paddle.y - paddle.height / 2), paddle.height, -45, 45);
			this.x = paddle.x + this.radius + paddle.width;

		}
		this.multiplayer.ballData(this)

	}

	xIsColliding(paddleRight: Paddle, paddleLeft: Paddle, x: number) : number
	{

		if(x - this.radius <= paddleLeft.width + paddleLeft.x)
			return 0;
		else if (x + this.radius >= paddleRight.x)
			return 1;
		return -1;
	}

	yIsColliding(paddle: Paddle, y: number): boolean
	{
		let paddleMin = paddle.y - (paddle.height / 2)
		let paddleMax = paddle.y + (paddle.height / 2)

		let ballMin = -this.radius + y
		let ballMax = this.radius + y
		if((ballMax < paddleMax && ballMax > paddleMin) || (ballMin < paddleMax && ballMin > paddleMin))
			return true
		return false
	}

	pointMarked(paddles: Paddle[] ,winner: number)
	{
		paddles[winner].score++;
        this.multiplayer.gameRequest({order: "newScore", side: winner})
		this.reset();
		if (paddles[winner].score >= 10)
		{
			this.multiplayer.stopGame()
			this.multiplayer.gameRequest({order: "gameWon", side: winner})
			// this.multiplayer.gameWon(winner)
		}
		return;
	}

	updatePosition(paddles: Paddle[])
	{
		let hx: number = Math.cos((this.angle * Math.PI) / 180) * this.speed  + this.x;
		let hy: number = Math.sin((this.angle * Math.PI) / 180) * this.speed  + this.y;

		let playerColliding = this.xIsColliding(paddles[1], paddles[0], hx)
		if (playerColliding != -1){
			if (this.yIsColliding(paddles[playerColliding], hy))
				return this.updateCollide(paddles[playerColliding], hy, hx, playerColliding)
		}
		if (hx < this.right && hx > this.left && hy < this.top && hy > this.bottom)
		{
			this.x = hx;
			this.y = hy;
			return;
		}

		if (hx <= this.left)
			this.pointMarked(paddles, 1)
		else if(hx >= this.right)
			this.pointMarked(paddles, 0)

		if (hy <= this.bottom || hy >= this.top)
		{
			this.angle = (-this.angle);
			if (hy <= this.bottom)
				this.y = this.bottom
			else
				this.y = this.top

			this.multiplayer.ballData(this)
		}
	
	}
}