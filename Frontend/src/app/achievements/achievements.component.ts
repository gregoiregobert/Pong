import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderbarComponent } from '../components/headerbar/headerbar.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { BACKEND } from '../env';

@Component({
  selector: 'app-achievements',
  standalone: true,
  imports: [CommonModule, HeaderbarComponent, HttpClientModule],
  templateUrl: './achievements.component.html',
  styleUrl: './achievements.component.scss'
})
export class AchievementsComponent {

	constructor(public http: HttpClient) {}

	id:number = 0;
	api_used: number = 0;
	twofa_used:number = 0;
	quit_count:number = 0;
	messages_sent:number = 0;
	friends_added:number = 0;
	friends_removed:number = 0;
	name_changed:number = 0;
	picture_changed:number = 0;
	profiles_searched:number = 0;
	cancelled_count:number = 0;
	refused_count:number = 0;
	accomplishments:any;

	messages = [];

	ngOnInit()
	{
		this.id = JSON.parse(localStorage.getItem('id')!)
		this.http.get(BACKEND.URL + 'users/' + this.id + '/achievements').subscribe(
			res => {
				this.accomplishments = [
					{ title: '42 student', instructions:'Log in with the 42 api', currentScore: res[0], paliers: [0, 0, 1] },
					{ title: 'Paranoid', instructions:'Use 2 factor authentication', currentScore: res[1], paliers: [0, 0, 1] },
					{ title: 'Quitter', instructions:'Use the logout button', currentScore: res[2], paliers: [1, 3, 5] },
					{ title: 'Talkative', instructions:'Send messages', currentScore: res[3], paliers: [10, 50, 100] },
					{ title: 'Harasser', instructions:'Add friends', currentScore: res[4], paliers: [1, 3, 5] },
					{ title: 'Popular', instructions:'Have friends', currentScore: res[5], paliers: [1, 2, 3] },
					{ title: 'Bipolar', instructions:'Remove friends', currentScore: res[6], paliers: [1, 2, 5] },
					{ title: 'Schizophrenic', instructions:'Change name', currentScore: res[7], paliers: [1, 2, 4] },
					{ title: 'Lunatic', instructions:'Change picture', currentScore: res[8], paliers: [1, 2, 4] },
					{ title: 'Stalker', instructions:'Search for profiles', currentScore: res[9], paliers: [1, 5, 10] },
					{ title: 'Addicted', instructions:'Play Games', currentScore: res[10], paliers: [1, 10, 20] },
					{ title: 'Tryharder', instructions:'Win games', currentScore: res[11], paliers: [1, 5, 10] },
					{ title: 'Optimistic', instructions:'Lose games', currentScore: res[12], paliers: [1, 5, 10] },
					{ title: 'Undecided', instructions:'Cancel friend requests', currentScore: res[13], paliers: [1, 3, 5] },
					{ title: 'Antisocial', instructions:'Refuse friend requests', currentScore: res[14], paliers: [1, 3, 5] },
					{ title: 'Nolife', instructions:'Master achievements', currentScore: res[15], paliers: [5, 10, 15] },
				  ];
			},
			err => {
				console.log(err)
			}
		)
	}

	
	  calculateProgress(accomplishment: any): number {
		const nextPalier = this.calculateNextPalier(accomplishment);
		const progress = (accomplishment.currentScore / nextPalier) * 100;
		return Math.min(100, Math.max(0, progress));
	  }
	
	  calculateNextPalier(accomplishment: any): number {
		return accomplishment.paliers.find(palier => palier > accomplishment.currentScore) || accomplishment.currentScore;
	  }
	
	  getAchievementClass(accomplishment: any): string {
		const progress = accomplishment.currentScore;
	
		if (progress >= accomplishment['paliers'][2])
		  	return 'master';
		else if (progress >= accomplishment['paliers'][1] && progress < accomplishment['paliers'][2])
		   return 'expert';
		else if (progress >= accomplishment['paliers'][0] && progress < accomplishment['paliers'][1])
			return 'intermediate'
		else
			return 'beginner';
	  }

}
