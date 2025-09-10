import { Player } from "./player.model";
import { Ball, Paddle } from "./game-elements.model";
import { MultiplayerService } from "../services/multiplayer.service";
import { GameService, WIDTH } from "../game.service";
import { PrismaService } from "src/prisma/prisma.service";

export class Room{

    multiplayer: MultiplayerService;
    players: Player[] = [];

    id: number;

    ball: Ball
    paddles: Paddle[] = [];

    isGameRunning: boolean = false

    constructor(roomId: number, playerOne: Player, playerTwo: Player, gameService: GameService, public prisma: PrismaService){

        this.multiplayer = new MultiplayerService(this, gameService)

        this.id = roomId
        this.players.push(playerOne)
        this.players.push(playerTwo)
        for (let i: number = 0; i < 2; i++)
        {
            this.players[i].lookingForPlayer = false
            this.players[i].room = this
            this.players[i].status = true;
        }

        this.ball = new Ball(this.multiplayer)

        this.paddles.push(new Paddle(0, this.multiplayer))
        this.paddles.push(new Paddle(1, this.multiplayer))


        // console.log(playerOne.login + " and " + playerTwo.login + " entered room " + roomId)
        this.multiplayer.gameBoardInit()
    }

    log()
    {
		console.log(" ************* ")
        for (let i = 0; i < 2; i++)
        {
            console.log("player: " + this.players[i].login + " status: " + this.players[i].status)
            console.log("paddle " + this.paddles[i].side)
			console.log("x: " + this.paddles[i].x + " / y: " + this.paddles[i].y)
            console.log(" -------------------------- ")
            
        }
		console.log("ball: x: " + this.ball.x + " / y: " + this.ball.y)
		console.log(" ************* ")

    }


    async destroyRoom()
    {
        // this.multiplayer.gameRequest({order: "resetBoard"})
		// console.log("destroyRoom")
        this.multiplayer.stopGame()
        this.isGameRunning = false

        if (this.paddles[0].score > this.paddles[1].score)
            this.multiplayer.gameWon(0)
        else if (this.paddles[0].score < this.paddles[1].score)
            this.multiplayer.gameWon(1)

        for (let i: number = 0; i < 2; i++)
        {
            this.players[i].room = undefined
            await this.prisma.user.update({
                where: {
                    login: this.players[i].login,
                },
                data: {
                    is_ingame : false
                }
                })
        }
    }
    
}