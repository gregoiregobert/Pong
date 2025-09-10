import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { BACKEND } from 'src/app/env';
import { CustomSocket } from 'src/app/chat/sockets/custom-socket';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-friend-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './friend-menu.component.html',
  styleUrls: ['./friend-menu.component.scss']
})
export class FriendMenuComponent implements OnInit, OnDestroy{
	username: string;
	@Input() id: number
	@Input() name: string
	statusSubscription : Subscription

	currentId = JSON.parse(localStorage.getItem('id')!);

	status: string;

	constructor(public http: HttpClient,
				private route:ActivatedRoute,
				private router: Router,
				private socket: CustomSocket,
				) {}

	ngOnInit(): void {

		this.statusSubscription = this.socket.fromEvent("sendStatus").subscribe((payload: any) =>{
			this.status = payload
			
		});
		// this.socket.emit("whatStatus", this.currentId);
		this.socket.emit("findUser", this.id);
		this.socket.fromEvent("userFound").subscribe(() =>{

		});

		this.http.get<any>(BACKEND.URL + "users/" + this.id).subscribe (
		res => {                                       
			this.username = res['login'];
		})

		
	}

	ngOnDestroy(): void {
		if(this.statusSubscription)
			this.statusSubscription.unsubscribe()
	}

	deleteFriend()
	{
		this.http.patch(BACKEND.URL + 'users/' + localStorage.getItem('id') + '/RemoveFriend', {userId: this.id}).subscribe()
		{
			this.router.navigateByUrl('/Home',{skipLocationChange:true}).then(()=>{
				this.router.navigate([window.location.pathname]).then(()=>{
				})
			})
		}
	}


	inviteToPlay()/*invitedUser?: string, currentUser?: string*/
	{
		this.socket.emit("invite_to_play?", {id: this.id, currentId: this.currentId});
	}

	sendMessage() {
		this.socket.emit("mpUser", this.id);
		this.router.navigate(['chat']);
	}

}
