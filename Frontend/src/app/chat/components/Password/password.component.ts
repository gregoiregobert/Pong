import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { CustomSocket } from '../../sockets/custom-socket';
import { RoomI } from '../../model/room.interface';

@Component({
  selector: 'app-invite-to-play',
  standalone: true,
  imports: [
	CommonModule,
	MatIconModule,
	MatDialogClose,
	MatDialogContent,
	MatDialogActions,
	MatButtonModule,
	MatDialogTitle,
	MatFormFieldModule,
	MatInputModule,
	FormsModule,
],
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss'],
})
export class PasswordRoomComponent implements OnInit{

	room: RoomI;
	currentUserId;
	password;
	
	constructor(
		private dialogRef: MatDialogRef<PasswordRoomComponent>,
		private socket: CustomSocket,
		@Inject(MAT_DIALOG_DATA) public data: any) {
		this.room = data.room;
	}

	ngOnInit() : void {
		this.currentUserId = JSON.parse(localStorage.getItem('id')!);
	}

	verifyPassword() {
		this.socket.emit("verifyPass", { pass: this.password, room: this.room });
		this.socket.fromEvent("PassResponse").subscribe((value) => {
			this.dialogRef.close(value);
		});
	}
}
		
		