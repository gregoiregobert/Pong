import { Component, OnDestroy, OnInit } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { Observable, Subscription, take } from 'rxjs';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UserI } from '../../model/user.interface';
import { RoomI } from '../../model/room.interface';
import { CustomSocket } from '../../sockets/custom-socket';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { invite_to_playComponent } from '../invite_to_play/invite_to_play.component';


@Component({
  selector: 'app-option-user',
  standalone: true,
  templateUrl: './option-user.component.html',
  imports: [ CommonModule,
			MatCardModule,
			MatListModule,
			MatIconModule,
			MatButtonModule,
			invite_to_playComponent,
			],
  styleUrls: ['./option-user.component.scss']
})
export class OptionUserComponent implements OnInit, OnDestroy{

	user: UserI | undefined;
	room: RoomI | undefined;
	current_user: UserI | undefined = this.userService.getLoggedInUser();
	
	adminArray: UserI[] | undefined;
	blockedUserList: UserI[] | undefined;
	mutedUserList: UserI[] | undefined;
	banList: UserI[] | undefined;
	InRoomList: UserI[] | undefined;

	adminUser: boolean;
	adminCurrent: boolean;

	isUserCreator: boolean;
	isCurrentCreator: boolean;

	isUserBlocked: boolean;

	isUserMuted: boolean;

	isUserBan: boolean;

	isUserInRoom: boolean;

	Usersub: Subscription;
	RoomSub: Subscription;
	AdminSub: Subscription;
	CreatorSub: Subscription;
	BlockSub: Subscription;
	MuteSub: Subscription;
	BanSub: Subscription;
	InRoomSub: Subscription;

  constructor(	private userService: UserService,
				private socket: CustomSocket,
				private socketService: SocketService,
				private router: Router,
				public dialog: MatDialog) {}
  
  	ngOnInit(): void {
		// Current user ?
		this.socketService.emitGetCurrentUser();
		this.socketService.getCurrentUser().pipe(take(1)).subscribe( value => {
			this.current_user = value;
		});

		// User on click ? 
		this.Usersub = this.userService.user$.subscribe(value => {
			this.user = value;

			// Current room ?
			this.RoomSub = this.userService.room$.subscribe(value => {
				this.room = value;
			});

			// Admin ?
			this.AdminSub = this.getAdminArray().subscribe(value => {
				if (value.id == this.room?.id) {
					this.adminArray = value.admin;
					this.adminUser = this.isAdmin(this.user);
					this.adminCurrent = this.isAdmin(this.current_user) 
				}
			});

			// Creator ?
			this.socket.emit("getCreatorId", this.room);  
			this.CreatorSub = this.socket.fromEvent("creatorId").subscribe(value => {
				if(this.user?.id === value) {
					this.isUserCreator = true;
				} else {
					this.isUserCreator = false;
				}
				if(this.current_user?.id === value) {
					this.isCurrentCreator = true;
				} else {
					this.isCurrentCreator = false;
				}
			});

			// BlockedUser ?
			this.socket.emit("blockedUsers");
			this.BlockSub = this.socket.fromEvent<UserI[] | undefined>("blockedUsersList").subscribe(value =>{
				this.blockedUserList = value;
				this.isUserBlocked = this.isBlocked();
			});
			
			// Muted ?
			this.socket.emit("MutedUsers", this.room);
			this.MuteSub = this.socket.fromEvent<RoomI>("mutedUsersList").subscribe(value =>{
				if (this.room?.id === value.id) {
					this.mutedUserList = value.mutedUsers;
					this.isUserMuted = this.isMuted();
				}
			});

			// Ban ?
			this.socket.emit("getBanList", this.room);
			this.BanSub = this.socket.fromEvent<UserI[] | undefined>("banList").subscribe(value =>{
				this.banList = value;
				this.isUserBan = this.isBan();
			});

			// In Room ?
			this.socket.emit("InRoom?", this.room)
			this.InRoomSub = this.socket.fromEvent<UserI[] | undefined>("InRoomList").subscribe(value => {
				this.InRoomList = value;
				this.isUserInRoom = this.isInRoom();
			});
		});

	}

	
	ngOnDestroy(): void {
		if(this.Usersub)
			this.Usersub.unsubscribe();
		if (this.AdminSub)
			this.AdminSub.unsubscribe();
		if (this.RoomSub)
			this.RoomSub.unsubscribe();
		if (this.BlockSub)
			this.BlockSub.unsubscribe();
		if (this.MuteSub)
		this.MuteSub.unsubscribe();
		if (this.CreatorSub)
			this.CreatorSub.unsubscribe();
		if (this.BanSub)
			this.BanSub.unsubscribe();
		if (this.InRoomSub)
			this.InRoomSub.unsubscribe();
	}

	inviteToPlay()/*invitedUser?: string, currentUser?: string*/
	{
		this.socket.emit("invite_to_play?", {id: this.user?.id, currentId: this.current_user?.id});
	}

	goToProfile()
	{
		this.router.navigate(['/user'], { queryParams: { id: this.user?.id } })
	}

	getAdminArray(): Observable<RoomI> {
		this.socket.emit("getAdminList", this.room);
		return this.socket.fromEvent("isAdmin");
	}

	closeOption() {
		this.userService.changeOption(false, undefined);
	}

	isAdmin(user: UserI | undefined): boolean {
		if (!this.adminArray)
			return false;

		for(const admin of this.adminArray)
			if (admin.id === user?.id)
				return true;
		return false;
	}

	isBlocked(): boolean {
		if (!this.blockedUserList )
			return false;

		for(const user of this.blockedUserList)
			if (user.id === this.user?.id)
				return true;
		return false;
	}

	isMuted(): boolean {
		if (!this.mutedUserList)
			return false;

		for(const user of this.mutedUserList)
			if (user.id === this.user?.id)
				return true;
		return false;
	}

	isInRoom(): boolean {
		if (!this.InRoomList)
			return false;

		for(const user of this.InRoomList)
			if (user.id === this.user?.id)
				return true;
		return false;
	}
	  
	setAsAdmin() {
		// console.log("setAdmin")
		this.socket.emit("setAsAdmin", { user: this.user, room: this.room });
	}

	unsetAsAdmin() {
		// console.log("setAdmin")
		this.socket.emit("unsetAsAdmin", { user: this.user, room: this.room });
	}

	blockUser() {
		this.socket.emit("blockUser", this.user);
	}

	unblockUser() {
		this.socket.emit("unblockUser", this.user);
	}

	muteUser() {
		this.socket.emit("muteUser", { user: this.user, room: this.room });
	}

	kickUser() {
		this.socket.emit("kickUser", { user: this.user, room: this.room });
	}

	banUser() {
		this.socket.emit("banUser", { user: this.user, room: this.room });
	}

	unbanUser() {
		this.socket.emit("unbanUser", { user: this.user, room: this.room });
	} 

	isBan(): boolean {
		if ( !this.banList )
			return false;

		for(const user of this.banList)
			if (user.id === this.user?.id)
				return true;
		return false;
	}

	directMessage() {
		this.socket.emit("mpUser", this.user?.id);
		this.closeOption();
	}
}