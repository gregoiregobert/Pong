import { Injectable } from '@angular/core';
import { CustomSocket } from '../sockets/custom-socket';
import { RoomI } from 'src/app/chat/model/room.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { MessageI } from '../model/message.interface';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private socket: CustomSocket, private snackbar: MatSnackBar) { }


	joinRoom(room: RoomI) {
		this.socket.emit('joinRoom', room);
	}

	leaveRoom(room: RoomI) {
		this.socket.emit('leaveRoom', room);
	}

	sendMessage(message: MessageI) {
		this.socket.emit('addMessage', message);
	}

	getMessage(): Observable<MessageI[]> {
		return this.socket.fromEvent<MessageI[]>('messages');
	}

	getAddedMessage(): Observable<MessageI> {
		return this.socket.fromEvent<MessageI>('messageAdded');
	}

	getRooms(): Observable<RoomI[]> {
		return this.socket.fromEvent('roomsI');
	}  

	emitRooms() {
		this.socket.emit('roomsArray');
	}

	createRoom(room: RoomI) {
		this.socket.emit('createRoom', room);
		this.snackbar.open(`Room ${room.name} created succefully`, 'Close' ,{
			duration: 2000, horizontalPosition: 'right', verticalPosition: 'top'
		} );
	}

	disconnect() {
		// console.log('Disconnect');
		this.socket.disconnect();
	}
}
