import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SettingsComponent } from 'src/app/settings/settings.component';
import { CustomSocket } from 'src/app/chat/sockets/custom-socket';
import { HttpClient } from '@angular/common/http';
import { BACKEND } from 'src/app/env';
import { Subscription, Observable, Subject, from} from 'rxjs';
import { ContentObserver } from '@angular/cdk/observers';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { invite_to_playComponent } from 'src/app/chat/components/invite_to_play/invite_to_play.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-headerbar',
  standalone: true,
  imports: [CommonModule, RouterModule, SettingsComponent],
  templateUrl: './headerbar.component.html',
  styleUrls: ['./headerbar.component.scss']
})
export class HeaderbarComponent implements OnInit, OnDestroy{

	constructor(
		private socket: CustomSocket,
		private http: HttpClient,
		public dialog: MatDialog,
		private router: Router,
		public snackbar: MatSnackBar,

		) {}

	dataSubscription: Subscription
	id;
	login: string;

	currentId: number;

	ngOnInit()
	{
		// this.currentId = JSON.parse(localStorage.getItem('id')!)
		this.retrieveUser();
		this.getId();
		this.dataSubscription = this.socket.fromEvent("onInviteRequest").subscribe((payload: any) =>{
			if (!payload.order)
				return;
			this.handleOrder(payload.order, payload);
		});
	}

	ngOnDestroy(): void {
		if (this.dataSubscription)
			this.dataSubscription.unsubscribe();
	}

	handleOrder(order:string, payload:any)
	{
		switch(order){
			case "closeAllDialogs":
				this.dialog.closeAll()
			break;

			case "invited to play":
				const inviterI = payload.inviterI;

				const dialogRef = this.dialog.open(invite_to_playComponent, {
					width: '300px',
					data: { login: inviterI.login }
				});
				dialogRef.afterClosed().subscribe(result => {
					if (result == 1) {
						this.socket.emit('closeAll', this.id)
						this.socket.emit('checkAndAccept', inviterI)
						this.router.navigate(['/game'])


					} else if (result == -1){
						this.socket.emit('closeAll', this.id)
						this.socket.emit("refuseGame", inviterI);

					}
					this.socket.emit('closeAll', this.id)
				});
				break;
				case "you are game":
					this.snackbar.open(`You already have a game started.`, 'Close' ,{
						duration: 3000, horizontalPosition: 'right', verticalPosition: 'top'
					});
				break;
				case "accepted to play":
					this.socket.emit("checkAndLaunch", {currentUser: payload.inviterI.login, invitedUser: payload.invited_login})
					this.router.navigate(['/game'])
				break;

				case "refuse to play":
					this.snackbar.open(`${payload.login} has refused to play with you`, 'Close' ,{
									duration: 3000, horizontalPosition: 'right', verticalPosition: 'top'
								});
				break;

				case "player in game":
					this.snackbar.open(`${payload.login} is in game`, 'Close' ,{
									duration: 3000, horizontalPosition: 'right', verticalPosition: 'top'
								});
				break;
				case "player offline":
					this.snackbar.open(`${payload.login} is offline`, 'Close' ,{
									duration: 3000, horizontalPosition: 'right', verticalPosition: 'top'
								});
				break;
		}
		
	}

	getId()
	{
		this.id = JSON.parse(localStorage.getItem('id')!);
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
}
