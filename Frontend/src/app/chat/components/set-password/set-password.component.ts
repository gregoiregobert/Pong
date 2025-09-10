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
  templateUrl: './set-password.component.html',
  styleUrls: ['./set-password.component.scss'],
})
export class SetPasswordComponent{

	room: RoomI;
	newPassword;
	
	constructor(
		private dialogRef: MatDialogRef<SetPasswordComponent>,
		private socket: CustomSocket,
		@Inject(MAT_DIALOG_DATA) public data: any) {
		this.room = data.room;
	}

	setPassword() {
		this.socket.emit("setPassword", { newPass: this.newPassword, room: this.room });
		this.dialogRef.close();
	}
}
		
		