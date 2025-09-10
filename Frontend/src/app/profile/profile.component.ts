import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderbarComponent } from '../components/headerbar/headerbar.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { ProfilePictureComponent } from '../components/profile-picture/profile-picture.component';
import { ActivatedRoute } from '@angular/router';
import { GamehistoryComponent } from '../components/gamehistory/gamehistory.component';
import { PictureComponent } from '../components/picture/picture.component';
import { FooterBarComponent } from '../components/footer-bar/footer-bar.component';
import { BACKEND } from '../env';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, HeaderbarComponent, HttpClientModule, RouterModule, ProfilePictureComponent, GamehistoryComponent, PictureComponent, FooterBarComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {

	id:number = 0;
	elo:number = 0;

	constructor(public http: HttpClient, public router:Router, private route: ActivatedRoute){}
	ngOnInit()
	{
		this.getuserbyId();
		this.getuserElo()
	}
	getuserbyId(): void
	{
		this.route.queryParams.subscribe(params => {
			this.id = params['id'];
		})
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
