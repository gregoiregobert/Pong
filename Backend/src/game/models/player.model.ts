import { Socket } from "socket.io";
import { Room } from "./room.model";
import { Paddle } from "./game-elements.model";
import { PrismaService } from "src/prisma/prisma.service";

export class Player{
    socket: Socket;
    score: number;
    room: Room | undefined;


    lookingForPlayer = false;
    status: boolean = false;
    connected: boolean = true;

    constructor(socket: Socket, public login: string){
        
        this.room = undefined
        this.socket = socket;
        this.score = 0;
        // console.log(login + " player created.")
    }
}