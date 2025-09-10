import { GameBoardComponent, HEIGHT, WIDTH } from "../game-board/game-board.component";

export const PADDLE_HEIGHT = 200
export const PADDLE_WIDTH = 25

export class Paddle{
	step: number = 160;

	x!: number;
	y!: number;
	targetY: number;

	score: number = 0;
	side: number;
	login: string | undefined;

	colorId: number = 0;
	colorTab: string[] = ['red', 'dodgerblue', 'black', 'yellow'];
	

	constructor( public context: CanvasRenderingContext2D)
	{
	}
	  

	draw(){
		// console.log(this.colorTab[this.colorId])
		this.context.fillStyle = this.colorTab[this.colorId];
		this.context.fillRect(this.x, this.y - PADDLE_HEIGHT/2, PADDLE_WIDTH, PADDLE_HEIGHT);
		this.context.fillRect(this.x, this.y - PADDLE_HEIGHT/2, PADDLE_WIDTH, PADDLE_HEIGHT);
	}

	changeColor()
	{
		this.colorId++
		if (this.colorId >= this.colorTab.length)
			this.colorId = 0;
	}


	reset(x: number, y: number, score: number)
	{
		this.x = x;
		this.y = y;
		this.targetY = y;
		this.score = score
	}

	newPosition(y: number)
	{
		this.y += y;
	}
}