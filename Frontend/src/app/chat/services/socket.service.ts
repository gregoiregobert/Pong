import { Injectable, OnInit } from "@angular/core";
import { CustomSocket } from "../sockets/custom-socket";
import { Observable } from "rxjs";
import { UserI } from "../model/user.interface";

@Injectable({
	providedIn: 'root'
  })
  export class SocketService implements OnInit{

	constructor(private socket: CustomSocket) { }

	user: Observable<UserI> = this.socket.fromEvent('currentUser');

	ngOnInit(): void {
		this.emitGetCurrentUser();
	}

	emitGetCurrentUser() {
		this.socket.emit('getCurrentUser');
	}
	getCurrentUser(): Observable<UserI> {
		return this.socket.fromEvent('currentUser');
	}
  }