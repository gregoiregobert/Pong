import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { HeaderbarComponent } from '../components/headerbar/headerbar.component';
import { ProfilePictureComponent } from '../components/profile-picture/profile-picture.component';
import { GamehistoryComponent } from '../components/gamehistory/gamehistory.component';
import { PictureComponent } from '../components/picture/picture.component';
import { FriendrequestComponent } from '../components/friendrequest/friendrequest.component';
import { RequestSentComponent } from '../components/request-sent/request-sent.component';
import { BACKEND } from '../env';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [CommonModule, HeaderbarComponent, HttpClientModule, RouterModule, ProfilePictureComponent, GamehistoryComponent, PictureComponent,FriendrequestComponent, RequestSentComponent],
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.scss']
})

export class RequestsComponent {
	id:number = 0;
	elo:number = 0;
	friendrequestsreceived: number[] = [];
	friendrequestssent: number[] = [];

	constructor(public http: HttpClient, public router:Router, private route: ActivatedRoute){}
	ngOnInit()
	{
		this.id = JSON.parse(localStorage.getItem('id')!)
		this.http.get<number[]>(BACKEND.URL + "users/" + this.id + "/friendrequestsreceived").subscribe(res => {
			this.friendrequestsreceived = res;
		})	
		this.http.get<number[]>(BACKEND.URL + "users/" + this.id + "/friendrequestssent").subscribe(res => {
			this.friendrequestssent = res;
		})	
	}
}
