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
import { FooterBarComponent } from '../components/footer-bar/footer-bar.component';
import { BACKEND } from '../env';

@Component({
  selector: 'app-private-profile',
  standalone: true,
  imports: [CommonModule, HeaderbarComponent, HttpClientModule, RouterModule, ProfilePictureComponent, GamehistoryComponent, PictureComponent,FriendrequestComponent, RequestSentComponent, FooterBarComponent],
  templateUrl: './private-profile.component.html',
  styleUrls: ['./private-profile.component.scss']
})
export class PrivateProfileComponent {

	constructor(public http: HttpClient, public router:Router, private route: ActivatedRoute){}

	id:number = 0;
	elo:number = 0;
	played:number = 0;
	won:number = 0;
	winrate:number = 0;

	ngOnInit()
	{
		this.id = JSON.parse(localStorage.getItem('id')!)
		this.http.get<number>(BACKEND.URL + 'users/' + this.id ).subscribe(
			res => {
				this.elo = res['elo']
				this.played = res['gameHistory'].length
				this.won = res['gamesWon']
				if (this.played == 0)
					this.winrate = 0;
				else
					this.winrate = Math.round(res['gamesWon'] / res['gameHistory'].length * 100)
			},
			err => {
				console.log(err)
			}
		)
		this.getuserElo();
	}


	getuserElo()
	{
		this.http.get<number>(BACKEND.URL + 'users/' + this.id + '/getelo').subscribe(
			res => {
				this.elo = res
			},
			err => {
				console.log(err)
			}
		)
	}
}
