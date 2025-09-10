import { GameBoardComponent, HEIGHT, WIDTH } from "../game-board/game-board.component";
import { Paddle } from "./paddle.model";
export class Ball{
	public speed: number;
	public radius: number = 15;
	public angle: number;
	public x: number = 0
	public y: number = 0
	colorTab: string[] = ['blue', 'black', 'purple', 'khaki'];
	colorId: number = 0;


	constructor(public context: CanvasRenderingContext2D)
	{

	}

	changeColor()
	{
		this.colorId++
		if (this.colorId >= this.colorTab.length)
			this.colorId = 0;
	}
	
	reset(angle: number, x: number, y: number)
	{
		this.x = x
		this.y = y
		this.angle = angle;
	}
	
	draw()
	{
		this.context.beginPath();
		this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		this.context.fillStyle = this.colorTab[this.colorId];
		this.context.fill();
		this.context.closePath();
	}
}