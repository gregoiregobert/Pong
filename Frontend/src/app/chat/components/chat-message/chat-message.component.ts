import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { CommonModule } from '@angular/common';
import { MessageI } from '../../model/message.interface';
import { UserService } from '../../services/user.service';
import { UserI } from '../../model/user.interface';
import { CustomSocket } from '../../sockets/custom-socket';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  templateUrl: './chat-message.component.html',
  imports: [ CommonModule ],
  styleUrls: ['./chat-message.component.scss'],
})
export class ChatMessageComponent implements OnInit, OnDestroy{

	@Input() message: MessageI;
	id;
	blockedUserList: UserI[] | undefined;

	subBlock: Subscription;

	constructor(private socketService: SocketService, 
				private socket: CustomSocket,
				private userService: UserService) {}

	ngOnInit(): void {
		this.id = JSON.parse(localStorage.getItem('id')!);

		// BlockedUser ?
		this.socket.emit("blockedUsers");
		this.subBlock = this.socket.fromEvent<UserI[] | undefined>("blockedUsersList").subscribe(value =>{
			this.blockedUserList = value;
		});
	}

	ngOnDestroy(): void {
		if (this.subBlock)
			this.subBlock.unsubscribe();
	}

	openOption(user_: UserI | undefined) {
		this.userService.changeOption(true, user_);
	}

	isBlocked(id: number | undefined) {
		if(!id || !this.blockedUserList)
			return false;

		for(const user of this.blockedUserList)
			if (user.id === id)
				return true;
		return false;
	}
}