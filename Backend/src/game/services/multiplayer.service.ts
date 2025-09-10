import { Player } from "../models/player.model";
import { Room } from "../models/room.model";
import { Ball, Paddle } from "../models/game-elements.model";
import { Injectable } from "@nestjs/common";
import { GameService } from "../game.service";
import { GameInfoDto } from "../dto/GameInfor.dto";

export class MultiplayerService{

    oldTimeStamp : number;

    random: boolean = false;


    previousBallState: {x: number, y : number, angle: number};

    constructor(private room: Room, private gameService: GameService){}

    gameRequest(payload: any)
    {
        for (let i: number = 0; i < 2; i++)
        {
            if (this.room.players[i].status == true)
                this.room.players[i].socket.emit('onGameRequest', payload)
        }
    }


    ballData(ball: Ball)
    {
        const deltaX = ball.x - this.previousBallState.x
        const deltaY = ball.y - this.previousBallState.y
        const deltaAngle = ball.angle - this.previousBallState.angle

        this.gameRequest({order: "ballPosition", x: deltaX, y: deltaY, angle: deltaAngle})

        this.previousBallState.x = ball.x
        this.previousBallState.y = ball.y
        this.previousBallState.angle = ball.angle
    }

    ballReset(ball: Ball)
    {
        this.gameRequest({order: "ballReset", x: ball.x, y: ball.y, angle: ball.angle})
    }

    paddleData(paddle: {y: number, side: number})
    {
        this.room.paddles[paddle.side].y += paddle.y
        if (paddle.side == 1)
          this.room.players[0].socket.emit("onGameRequest", {order: "paddlePosition", side: paddle.side, y: paddle.y})
        else
          this.room.players[1].socket.emit("onGameRequest", {order: "paddlePosition", side: paddle.side, y: paddle.y})
    }

    paddleReset(paddle: Paddle)
    {
        this.gameRequest({order: "resetPaddle", side: paddle.side, x: paddle.x, y: paddle.y, score: paddle.score})
    }

    sendScore(side: number)
    {
        this.gameRequest({order: "newScore", side: side})
    }

    gameWon(sideWinner: number)
    {
        const gameInfoDto = new GameInfoDto();
        gameInfoDto.userId1 = this.room.players[0].socket.data.user.id
        gameInfoDto.userId2 = this.room.players[1].socket.data.user.id
        gameInfoDto.scoreUser1 = this.room.paddles[0].score
        gameInfoDto.scoreUser2 = this.room.paddles[1].score
        gameInfoDto.winnerId = this.room.players[sideWinner].socket.data.user.id
        this.gameService.newgame(gameInfoDto)
    }

    gameLoop()
	{
        if (!this.room || !this.room.isGameRunning) {
            return;
        }
        const timeStamp = Date.now()
        const secondsPassed = (timeStamp - this.oldTimeStamp) / 1000;
        this.room.ball.updatePosition(this.room.paddles)
        this.room.ball.speed *= 1 + secondsPassed / 30000
		this.ballData(this.room.ball)

        setTimeout(() => {
            this.gameLoop();
        }, 1000 / 60);
	}
    

    stopGame()
    {
        this.room.isGameRunning = false;
        this.gameRequest({order: "stopGame"})
    }

    activateGameMode(wanted: boolean)
    {
        this.random = wanted;
        this.gameRequest({order: "gameModeChange", status: this.random})
    }



    async gameBoardInit()
    {
        if (!this.room) {
            return;
        }
        for (let i: number = 0; i < 2; i++)
        {
            await this.room.prisma.user.update({
                where: {
                   login: this.room.players[i].login,
                },
            
                data: {
                    is_ingame : true
                }
            })
        }
        this.room.players[0].socket.emit('onGameRequest', {order: 'usersPaddle', side: 0, login: this.room.players[1].login})
        this.room.players[1].socket.emit('onGameRequest', {order: 'usersPaddle', side: 1, login: this.room.players[0].login})
        this.gameRequest({order: "setGameBoard"})
		this.gameLoop = this.gameLoop.bind(this)
        setTimeout(() => {
            if (this.room.players[0].room == undefined && this.room.players[1].room == undefined)
                return;
            this.room.isGameRunning = true
            this.gameRequest({order: "startGame"})
            this.oldTimeStamp = Date.now()
            this.gameLoop();
        }, 3000);
    }


    reload(side: number)
    {
        this.room.players[side].socket.emit('onGameRequest', {order: "reload"})
        this.room.players[side].status = true
        this.room.paddles[side].randomWanted = false
        this.room.players[side].socket.emit('onGameRequest', {order: 'usersPaddle', side: side, login: this.room.players[side * -1 + 1].login, random: this.random})
        this.paddleReset(this.room.paddles[0])
        this.paddleReset(this.room.paddles[1])
        this.ballReset(this.room.ball)
        this.room.players[side].socket.emit('onGameRequest', {order: "setGameBoard"})
        this.room.players[side].socket.emit('onGameRequest', {order: "startGame"})
        for (let i: number = 0; i < 2; i++)
        {
            if (this.room.paddles[i].score >= 10)
			    this.room.players[side].socket.emit('onGameRequest',{order: "gameWon", side: i})
        }
    }
}