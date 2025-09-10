import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription, of, take } from 'rxjs';
import { RoomI } from '../../model/room.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { MatSelectionListChange } from '@angular/material/list';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { ChatRoomComponent } from '../chat-room/chat-room.component';
import { UserService } from '../../services/user.service';
import { OptionUserComponent } from '../option-user/option-user.component';
import { CustomSocket } from '../../sockets/custom-socket';
import { HeaderbarComponent } from 'src/app/components/headerbar/headerbar.component';
import { invite_to_playComponent } from '../invite_to_play/invite_to_play.component';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HostListener } from '@angular/core';
import { BACKEND } from 'src/app/env';


@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule,
			MatCardModule,
			MatButtonModule,
			MatListModule,
			MatDividerModule,
			MatPaginatorModule,
			MatFormFieldModule,
			MatIconModule,
			HttpClientModule,
			RouterModule,
			ChatRoomComponent,
			OptionUserComponent,
			HeaderbarComponent,
			invite_to_playComponent,
			MatDialogModule,
			],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements AfterViewInit, OnInit, OnDestroy{
	
	room$: Observable<RoomI[]> = this.chatService.getRooms();
	selectedRoom: RoomI | null = null;
	userList :object[] = []
	login;
	option: boolean;

	invitedToPlaySubscription: Subscription;
	subOption: Subscription;
	subKick: Subscription;
	subMP: Subscription;


	constructor(
		private router: Router,
		private chatService: ChatService,
		public http: HttpClient,
		private userService: UserService,
		private socket: CustomSocket,
		public dialog: MatDialog,
		public snackbar: MatSnackBar,
		) {}

	ngOnInit(): void {
		this.retrieveUser();

		this.subOption = this.userService.option$.subscribe(value => {
			this.option = value;
		});

		this.subKick = this.socket.fromEvent("kicked").subscribe(() => {
			this.selectedRoom = null;
		});

		this.subMP = this.socket.fromEvent<RoomI>("MessageToUser").subscribe((value) => {
				this.selectedRoom = value;
		});
	}
	
	ngOnDestroy(): void {
		if (this.subOption)
			this.subOption.unsubscribe;
		if (this.subKick)
			this.subKick.unsubscribe;
		if (this.subMP)
			this.subMP.unsubscribe;
	}

	retrieveUser() {
		const id = JSON.parse(localStorage.getItem('id')!);

		this.http.get<any>(BACKEND.URL + "users/" + id).subscribe (
		   res => {
			   this.login = res['login'];
		   },
		   err => {
			   alert("user doesn't exist");
		   })
	}

	ngAfterViewInit() {
		this.chatService.emitRooms();
	}

	onSelectRoom(event: MatSelectionListChange) {
			this.userService.changeOption(false, undefined);
			this.selectedRoom = event.source.selectedOptions.selected[0].value;
	}

	LaunchCreateRoom() {
		this.router.navigate(['chat','create-room']);
	}
}
