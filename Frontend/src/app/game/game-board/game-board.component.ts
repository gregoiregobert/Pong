import { Component, OnInit, ViewChild, ElementRef, HostListener, OnDestroy} from '@angular/core';
import { PADDLE_HEIGHT, Paddle } from '../models/paddle.model';
import { Ball } from '../models/ball.model';
import { Socket } from 'socket.io-client';
import { SocketDataService } from 'src/app/game/game-board/socket-data.service';
import { Observable, first } from 'rxjs';
import { CommonModule } from '@angular/common';
import { HeaderbarComponent } from 'src/app/components/headerbar/headerbar.component';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

export const WIDTH = 1000
export const HEIGHT = 640 

@Component({
	selector: 'app-game-board',
	standalone: true,
	templateUrl: './game-board.component.html',
	styleUrls: ['./game-board.component.scss'],
	providers:[],
	imports: [CommonModule, HeaderbarComponent]
  })

  export class GameBoardComponent implements OnInit, OnDestroy{

	@ViewChild('canvas', {static: true}) gameCanvas!: ElementRef;
	context!: CanvasRenderingContext2D;

	constructor(private player: SocketDataService,
		public dialog: MatDialog,
		public http: HttpClient,
		public snackbar: MatSnackBar,
		) {}

	data: Observable<any>;
	
	ball: Ball;

	userPaddle: Paddle;
    paddles: Paddle[] = [];

	isGameRunning: boolean = false;
	isOnline: boolean = false;
	matchmaking: boolean = false;
	showRules: boolean = false;
	multiWindow: boolean = false;

	randomMode: boolean = false;

	colorTab: string[] = ['black', 'darkred', 'limegreen', 'purple'];
	colorId: number = 0;

	login: string

	private dataSubscription: Subscription;

	movementQueue: { deltaX: number; deltaY: number, angle: number}[] = [];

	ngOnInit() {
		this.context = this.gameCanvas.nativeElement.getContext('2d');

        this.paddles.push(new Paddle(this.context))
        this.paddles.push(new Paddle(this.context))

		this.ball = new Ball(this.context);
		this.data = this.player.getData();
		this.dataSubscription = this.data.subscribe((payload: any) =>{
			if (!payload.order)
				return;
			this.handleOrder(payload.order, payload);
		});

		this.player.sendRequest("gameExists")
		this.gameLoop = this.gameLoop.bind(this);
		requestAnimationFrame(this.gameLoop);
	}

	ngOnDestroy(): void {

		this.disconnect()
		if (this.dataSubscription)
			this.dataSubscription.unsubscribe()
	}

	handleOrder(order:string, payload:any)
	{
		if (order == "reload")
		{
			this.drawBoard()
			this.multiWindow = false;
		}
		if (order == "gameChecked")
		{
			if (payload.exists && this.matchmaking)
				this.player.sendRequest("multiplayerRequest")
			else
				this.matchmaking = false
		}
		if (this.multiWindow == true)
			return;
		switch(order){
			case "ballPosition":
				this.newMovement(payload.angle, payload.x, payload.y)
			break;
			case "ballReset":
				this.movementQueue = []
				this.ball.reset(payload.angle, payload.x, payload.y)
			break;
			case "resetPaddle":
				this.paddles[payload.side].reset(payload.x, payload.y, payload.score)
			break;
			case "paddlePosition":
				this.paddles[payload.side].newPosition(payload.y)
			break;
			case "usersPaddle":
				this.userPaddle = this.paddles[payload.side]
				this.userPaddle.login = this.player.getLogin()
				this.userPaddle.side = payload.side;
				this.paddles[payload.side * -1 + 1].login = payload.login
				this.randomMode = payload.random
			break;
			case "multiWindow":
				this.multiWindow = true;
				this.matchmaking = false;
				this.drawBoard()
				this.context.font = '30px Arial';
    			this.context.fillStyle = 'white';
				this.context.fillText(`There is another game instance on this profile`, WIDTH/5, HEIGHT/2 - HEIGHT/3);
				this.context.fillText(`If this is not the case, click on multiplayer`, WIDTH/4, HEIGHT/4);
			break;
			case "setGameBoard":
				this.player.inGamePlayer()
				this.matchmaking = false
				this.isOnline = true
				this.draw()
			break;
			case "startGame":
				this.startGame()
			break;
			case "otherDisconnected":
				this.resetOnline()
			break;
			case "stopGame":
				this.stopGame()
			break;
			case "resetBoard":
				this.resetOnline()
				this.drawBoard()
			break;
			case "newScore":
				this.paddles[payload.side].score++
			break;
			case "gameWon":
				this.stopGame()
				this.draw()
				this.context.fillText(`${this.paddles[payload.side].login} WINS`, WIDTH / 2 * payload.side + WIDTH / 6, HEIGHT / 2);
				this.context.fillText(`${this.paddles[payload.side * -1 + 1].login} LOSES`, WIDTH / 2 * (payload.side * -1 + 1) + WIDTH / 6, HEIGHT / 2)
				setTimeout( () => {
					this.player.sendRequest("gameOver")
				}, 100 * this.userPaddle.side)
				this.disconnect()
			break;
			case "gameModeChange":
				this.randomMode = payload.status
			break;
			case "otherWantMode":

				this.snackbar.open(`${this.paddles[this.userPaddle.side * -1 + 1].login} wants to change the gamemode!`, 'Close' ,{
					duration: 3000, horizontalPosition: 'right', verticalPosition: 'top'});
				break;
		}
	}

	changeColor()
	{
		this.paddles[0].changeColor()
		this.paddles[1].changeColor()
		this.ball.changeColor()
		this.colorId++
		if (this.colorId >= this.colorTab.length)
			this.colorId = 0;
		if (this.isOnline)
			this.draw()
		if (this.matchmaking)
			this.drawBoard()
	}
	
	getColor() :string
	{
		return this.colorTab[this.colorId]
	}

	activateRandom()
	{
		if(!this.isOnline)
			return;
		this.player.gameMode(this.userPaddle.side, !this.randomMode)
	}

	resetOnline()
	{
		this.randomMode = false;
		this.isOnline = false
		this.isGameRunning = false;
		this.paddles[0].score = 0;
		this.paddles[1].score = 0;
		this.paddles.forEach((paddle) => {
			paddle.login = undefined
		})
	}

	newMovement(angle: number, deltaX: number, deltaY: number)
	{
		this.movementQueue.push({ deltaX: deltaX, deltaY: deltaY, angle: angle});
	}

	applyMovement(movement: { deltaX: number; deltaY: number, angle: number}/*, secondsPassed: number*/)
	{
		this.ball.x += movement.deltaX
		this.ball.y += movement.deltaY
		this.ball.angle += movement.angle
	}

	log()
	{
		this.player.sendRequest("logRequest")
		console.log(" ************* ")
        for (let i = 0; i < 2; i++)
        {
            console.log("player: " + this.paddles[i].login)
            console.log("paddle " + this.paddles[i].side)
			console.log("x: " + this.paddles[i].x + " / y: " + this.paddles[i].y)
            console.log(" -------------------------- ")
            
        }
		console.log("ball: x: " + this.ball.x + " / y: " + this.ball.y)
		console.log(" ************* ")

	}


	gameLoop()
	{
		if (!this.isGameRunning)
			return
		if (!this.userPaddle.login)
			this.userPaddle.login = this.player.getLogin()
		let y = this.lerp(this.userPaddle.y, this.userPaddle.targetY, 0.2)
		let deltaY = y - this.userPaddle.y
		if (deltaY)
		{
			this.player.newPaddlePosition({y: y - this.userPaddle.y, side: this.userPaddle.side})
			this.userPaddle.y = y;
		}
		this.movementQueue.forEach((movement) => {
			this.applyMovement(movement);

		  });
		this.movementQueue = [];
		this.draw();
		requestAnimationFrame(this.gameLoop);

	}

	private lerp(start: number, end: number, t: number): number {
		return start + t * (end - start);
	  }

	draw()
	{
		this.context.fillStyle = this.colorTab[this.colorId];
		this.context.clearRect(0, 0, WIDTH, HEIGHT);
		this.context?.fillRect(0, 0, WIDTH, HEIGHT);
		this.ball.draw();
		this.paddles[0].draw();
		this.paddles[1].draw();
		this.context.font = '30px Arial';
    	this.context.fillStyle = 'white';
    	this.context.fillText(`${this.paddles[0].score} - ${this.paddles[1].score}`, WIDTH / 2 - 50, 50);
	}

	multiplayerRequest()
	{
		if(this.isOnline)
			return;
		this.player.sendRequest("gameExists")
		this.matchmaking = true
	}

	drawBoard()
	{
		this.ball.draw()
		this.context.fillStyle = this.colorTab[this.colorId];
		this.context.clearRect(0, 0, WIDTH, HEIGHT);
		this.context?.fillRect(0, 0, WIDTH, HEIGHT);
	}

	startGame() {
		this.isGameRunning = true;
		this.gameLoop();
	}

	stopGame()
	{
		this.isGameRunning = false;
	}

	disconnect()
	{
		// this.player.sendRequest("disconnectingClient")
		if (!this.multiWindow)
			this.player.disconnect()
		this.resetOnline()
		this.matchmaking = false

	}

	@HostListener('document:keydown', ['$event'])
	handleKeyboardEvent(event: KeyboardEvent)
	{
		if (!this.isGameRunning)
			return; 
		event.preventDefault();
		this.updatePaddlePosition(this.userPaddle, event.key)
	}

	updatePaddlePosition(paddle: Paddle, event: string)
	{
		const top = HEIGHT - (PADDLE_HEIGHT / 2)
		const bottom = PADDLE_HEIGHT / 2

		if (!paddle)
			return;
		if((event == 'ArrowDown' || event == 's'))
		{
			if (paddle.y + paddle.step < top)
				paddle.targetY = paddle.y + paddle.step
			else
				paddle.targetY = top

		}
		if((event == 'ArrowUp' || event == 'w'))
		{
			if (paddle.y - paddle.step > bottom)
				paddle.targetY = paddle.y - paddle.step
			else
				paddle.targetY = bottom
		}
	}

	showPongRules() {
		this.showRules = true;
	  }
	  
	  closePongRules() {
		this.showRules = false;
	  }

  }

  

  // this.paddles.forEach((paddle) => {
		// 	let y = this.lerp(
		// 		paddle.y,
		// 		paddle.targetY,
		// 		0.3
		// 	);
		// 	this.player.newPaddlePosition({y: y - paddle.y, side: paddle.side})
		// 	paddle.y = y

		// })