import { Body, OnModuleInit, PayloadTooLargeException } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket} from "socket.io"
import { Player } from './models/player.model'; 
import { Room} from './models/room.model';
import { MultiplayerService } from './services/multiplayer.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { UserI } from 'src/chat/model/user.interface';
import { UserService } from 'src/user/user.service';
import { GameService } from './game.service';
import { pbkdf2 } from 'crypto';


@WebSocketGateway({
  cors: {
    origin: [process.env.FRONTEND_IP],
  }
})
export class GameGateway implements OnModuleInit{
  @WebSocketServer()
  server: Server;


  private connectedPlayers?: Map<string, Player> = new Map()
  private rooms: Room[] = []

  constructor(private prisma: PrismaService, private authService: AuthService, private userService: UserService, private gameService: GameService) {}

  onModuleInit(){
    this.server.on('connection', async (socket) => {
      await this.connection(socket)


      socket.on('disconnect', () => {
        this.disconnect(socket)
        
      });
    });
  }

  async connection(socket:Socket)
  {
    const decodedToken = await this.authService.verifyJwt(socket.handshake.headers.authorization);
            const user: UserI = await this.prisma.user.findUnique({
                where: { id: decodedToken.sub },
            });
      if (user === null)
			return 
      this.connectedPlayers.set(socket.id, new Player(socket, user.login))
  }

  async lookForGame(client: Socket): Promise<boolean>
  {
    let player = this.connectedPlayers.get(client.id)
    if (!player)
      await this.connection(client);
    this.playerExists(this.connectedPlayers.get(client.id))
    player = this.connectedPlayers.get(client.id)
    if (!player)
    {
      client.emit('onGameRequest', {order: "gameChecked", exists: false})
      return false;
    }
    if (player.room != undefined)
    {
      for (let i: number = 0; i < 2; i++)
        if (player.login == player.room.players[i].login)
        {
            player.room.players[i] = this.connectedPlayers.get(client.id)
            player.room.multiplayer.reload(i)
        }
    }
    client.emit('onGameRequest', {order: "gameChecked", exists: true})
    return true;
  }

  playerExists(newPlayer: Player)
  {
    try{
    if (!newPlayer || !newPlayer.login)
      return;
    this.connectedPlayers.forEach((player, index) => {
      if (!player || !player.login || player.login !== newPlayer.login || newPlayer.socket.id === player.socket.id)
        return;
      if(player.status === false)
      {
        if (player.room != undefined)
          newPlayer.room = player.room
        newPlayer.socket.emit('onGameRequest', {order: "reload"})
        player.socket.emit('onGameRequest', {order: "multiWindow"})
        this.connectedPlayers.delete(index)
      }

      else if(player.status === true)
      {
        newPlayer.socket.emit('onGameRequest', {order: "multiWindow"})
        this.connectedPlayers.delete(newPlayer.socket.id)
      }
    })}
    catch {
      console.log("player not initialized")
      return;
    }
  }

@SubscribeMessage('closeAll')
async closeAllDialogs(socket: Socket, id: number)
{
  const connectedUser = await this.prisma.connectedUser.findMany();
  for (const User of connectedUser) {
    if(id === User.userId) {
      this.server.to(User.socketId).emit("onInviteRequest", {
        order: "closeAllDialogs"
      });
    }
  }
}

  @SubscribeMessage('checkAndAccept')
  checkAndAccept(@ConnectedSocket() client : Socket, @MessageBody() user: UserI)
  {

    setTimeout( async() => {
      await this.lookForGame(client)
      const connectedUser = await this.prisma.connectedUser.findMany();
		  for (const User of connectedUser) {
		  	if(user.id === User.userId) {
		  		this.server.to(User.socketId).emit("onInviteRequest", {
            order: "accepted to play",
		  			inviterI: client.data.user,
		  			invited_login: user.login,
		  		});
		  	}
		  }
    }, 100);
  }


  @SubscribeMessage('checkAndLaunch')
 checkAndLaunch(@ConnectedSocket() client : Socket, @MessageBody() payload: any)
  {
    setTimeout(async () => {
      await this.lookForGame(client)
      this.pairPlayers({currentUser: payload.currentUser, invitedUser: payload.invitedUser})
      
  }, 100);

  }




  @SubscribeMessage('gameExists')
  gameExist(client:Socket)
  {
    this.lookForGame(client)
  }

  async getId(login: string): Promise<number>{
    return this.userService.getUserIdFromLogin(login)
  }

  getRoom(clientId: string) : Room{
    if (!this.connectedPlayers.get(clientId))
      return undefined;
    const targetRoom = this.connectedPlayers.get(clientId).room;
    return targetRoom;
  }

  @SubscribeMessage('gameOver')
  gameOver(@ConnectedSocket() client:Socket)
  {
	// console.log('gameOver')
    this.disconnectRoom(client.id)
  }

  async disconnectRoom(clientId: string){
    if (!this.connectedPlayers.get(clientId))
      return;
    const targetRoom = this.connectedPlayers.get(clientId).room;
    if (targetRoom)
    {
		for (let i: number = 0; i < 2; i++)
            targetRoom.players[i].room = undefined
    //   console.log(clientId + " destroying Room " + targetRoom.id)
      await targetRoom.destroyRoom()
      this.rooms.splice(targetRoom.id, 1);
    }
  }


  @SubscribeMessage('loginRequest')
  loginRequest(@ConnectedSocket() client:Socket)
  {
    if (this.connectedPlayers.get(client.id))
    client.emit('login', this.connectedPlayers.get(client.id).login)
  }


  getPlayer(login: string): Player
  {
    for (const [socketId, player] of this.connectedPlayers) {
      if (login == player.login)
        return player;
    }
    return undefined
  }

  isOnline(login: string): boolean
  {
    const player = this.getPlayer(login)
    if (!player)
      return false;
    if(player.room)
      return true
    return false;
  }

  // @SubscribeMessage('pairPlayers')
  async pairPlayers(/*@ConnectedSocket() client: Socket, @MessageBody() */players: {currentUser: string, invitedUser: string})
  {
    const invitedPlayer = this.getPlayer(players.invitedUser)
    const currentPlayer = this.getPlayer(players.currentUser)
    if (!invitedPlayer || !currentPlayer || currentPlayer.room || invitedPlayer.room)
      return;

    this.rooms.push(new Room(this.rooms.length , currentPlayer, invitedPlayer, this.gameService, this.prisma))
  }


  @SubscribeMessage('invite_to_play?')
	async invite_to_play( socket: Socket, ids: { id: number, currentId: number}) {
    const user = await this.prisma.user.findUnique({
      where: {id: ids.id}
    });

		const connectedUser = await this.prisma.connectedUser.findMany();
    const currentStatus = await this.userService.GetUserStatus(ids.currentId)

    if(currentStatus.status == "IN GAME")
    {
      socket.emit("onInviteRequest", {order: "you are game"})
      return;
    }

    const invitedStatus = await this.userService.GetUserStatus(ids.id)
    if (invitedStatus.status == "OFFLINE")
    {
      socket.emit("onInviteRequest", {order: "player offline", login: user.login})
      return;
    }

    else if (invitedStatus.status == "IN GAME")
    {
      socket.emit("onInviteRequest", {order: "player in game", login: user.login})
      return;
    }


		for (const User of connectedUser) {
			if(user.id === User.userId) {
        // console.log(user.login + " " + User.socketId)
				this.server.to(User.socketId).emit("onInviteRequest", { order: "invited to play", inviterI: socket.data.user });
			}

		}
	}

  @SubscribeMessage("whatStatus")
  async whatStatus(socket: Socket, id: number)
  {

    // const user = await this.prisma.user.findUnique({
    //   where: {id: id}
    // });
    const currentStatus = await this.userService.GetUserStatus(id)
    socket.emit("sendStatus", currentStatus.status)
  }

  @SubscribeMessage('refuseGame')
	async refuseGame( socket: Socket, user: UserI ) {

		const connectedUser = await this.prisma.connectedUser.findMany();
		for (const User of connectedUser)
			if(user.id === User.userId)
			  this.server.to(User.socketId).emit("onInviteRequest", {order: "refuse to play", login: socket.data.user.login})

				
	}
  

  @SubscribeMessage('disconnectingClient')
  warnOther(@ConnectedSocket() client: Socket)
  {
    this.disconnect(client)
  }

  disconnect(client: Socket)
  {
    const player = this.connectedPlayers.get(client.id)
    if (!player)
      return
    // console.log(player.login + " has disconnected");
    player.connected = false;
    player.status = false;
    player.lookingForPlayer = false

    const targetRoom = this.getRoom(client.id)
    if (!targetRoom)
      return;
    if (!targetRoom.players[0].status && !targetRoom.players[1].status)
      this.disconnectRoom(client.id);
  }

  @SubscribeMessage('randomWanted')
  randomWanted(@ConnectedSocket() client: Socket, @MessageBody() body: {side: number, wanted: boolean})
  {
    const targetRoom = this.getRoom(client.id)
    if (!targetRoom)
      return;
    targetRoom.paddles[body.side].randomWanted = body.wanted
    

    if(targetRoom.multiplayer.random != body.wanted && targetRoom.paddles[body.side].randomWanted == targetRoom.paddles[body.side * -1 + 1].randomWanted)
      targetRoom.multiplayer.activateGameMode(targetRoom.paddles[body.side].randomWanted)
    else if (body.wanted != targetRoom.multiplayer.random)
    targetRoom.players[body.side * -1 + 1].socket.emit("onGameRequest", {order: "otherWantMode"})
    
  }

  @SubscribeMessage('newPaddlePosition')
  setPaddle(@ConnectedSocket() client: Socket, @MessageBody() paddle: {y: number, side: number})
  {
    const targetRoom = this.getRoom(client.id)
    if (!targetRoom)
      return;
    targetRoom.multiplayer.paddleData(paddle);
  }

  
  @SubscribeMessage('logRequest')
  log(@ConnectedSocket() client: Socket)
  {
    const targetRoom = this.getRoom(client.id)
    if (!targetRoom)
      return;
    targetRoom.log()
  }

  @SubscribeMessage('multiplayerRequest')
  async searchMultiplayer(@ConnectedSocket() client: Socket) {
    const matchPlayer = this.connectedPlayers.get(client.id)
    if (!matchPlayer || matchPlayer.room != undefined)
      return;
    for (const [socketId, player] of this.connectedPlayers) {
      if (player.socket.id != client.id && player.lookingForPlayer)
      {
        this.rooms.push(new Room(this.rooms.length ,matchPlayer, player, this.gameService, this.prisma))
        return;
      }
    }
    matchPlayer.lookingForPlayer = true
    matchPlayer.socket.emit('onGameRequest', {order: "playerNotFound"})
  }
}

// await this.prisma.user.update({
	// 	where: {
	// 		login: login,
	// 	},
	// 	data: {
	// 		is_ingame : true
	// 	}
	// })