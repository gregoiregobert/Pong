import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { UserI } from 'src/app/chat/model/user.interface';
import { FormControl } from '@angular/forms';
import { Observable, Subscription, debounceTime, distinctUntilChanged, of, switchMap, take, tap } from 'rxjs';
import { UserService } from 'src/app/chat/services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { SocketService } from '../../services/socket.service';
import { MatDialogClose } from '@angular/material/dialog';
import { CustomSocket } from '../../sockets/custom-socket';
import { RoomI } from '../../model/room.interface';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-users',
  standalone: true,
  imports: [
	CommonModule,
	MatFormFieldModule,
	MatInputModule,
	MatAutocompleteModule,
	MatOptionModule,
	MatChipsModule,
	FormsModule,
	MatIconModule,
	ReactiveFormsModule,
	MatDialogClose
],
  templateUrl: './add-users.component.html',
  styleUrls: ['./add-users.component.scss'],
})
export class AddUsersComponent implements OnInit, OnDestroy{

	room: RoomI;
	UsersRoom: UserI[];

	subBan: Subscription;
	subUserRoom: Subscription;

	searchLogin = new FormControl();
	filteredUsers: UserI[] = [];
	selectedUser: UserI | null = null;
	currentUser$: Observable<UserI>;
	currentUserId;
	banList: UserI[] | undefined;
	
	constructor( private userService: UserService,
				 private socketService: SocketService,
				 private socket: CustomSocket,
				 private snackbar: MatSnackBar,
				 @Inject(MAT_DIALOG_DATA) public data: any) {
		this.room = data.room;
	}


	ngOnInit() : void {
		this.currentUserId = JSON.parse(localStorage.getItem('id')!);

		this.subBan = this.socket.emit("getBanList", this.room);
		this.socket.fromEvent<UserI[] | undefined>("banList").subscribe(value => {
			this.banList = value;
		});

		this.socket.emit("getUsersRoom", this.room);

		this.subUserRoom = this.socket.fromEvent<UserI[]>("UsersRoom").subscribe(value => {
			this.UsersRoom = value;
			

			this.searchLogin.valueChanges.pipe(
				debounceTime(500),
				distinctUntilChanged(),
				switchMap((login: string) => {
					if ( !login ) {
						this.filteredUsers = []
						return of([])
					}
					return this.userService.findByLogin(login).pipe(
						tap((users: UserI[]) => {
							this.filteredUsers = users.filter(user =>
								user.id !== this.currentUserId && !this.inRoom(user.id)
							  );
						})
					)
				})
			).subscribe();
		});

	}

	ngOnDestroy(): void {
		this.subBan.unsubscribe();
		this.subUserRoom.unsubscribe();
		if (this.subUserRoom)
			this.subUserRoom.unsubscribe();
	}

	addUserToRoom() {
		const isban = this.isBan( this.selectedUser?.id );

		if ( this.selectedUser !== null && !isban) {
			this.socket.emit("AddUser", { user: this.selectedUser, room: this.room })
		} else if ( isban ) {
			this.snackbar.open(`${this.selectedUser?.login} is ban from this room`, 'Close' ,{
				duration: 4000, horizontalPosition: 'right', verticalPosition: 'top'
			});
		}



		this.filteredUsers = [];
		this.selectedUser = null;
		this.searchLogin.setValue(null);		
	}

	inRoom(id: number | undefined) {
		for(const user of this.UsersRoom)
			if (id === user.id)
				return true;
		return false;
	}
	
	setSelectedUser(user: any) {
		this.selectedUser = user;
	}
	
	displayFn(user: UserI | undefined): string {
		if (user && user.login) {
			return user.login;
		} else {
			return '';
		}
	}

	isBan(id: number | undefined): boolean {
		if (!this.banList )
		{
			// console.log("here");
			return false;
		}

		for(const user of this.banList)
			if (user.id === id)
				return true;
		return false;
	}
}
		
		