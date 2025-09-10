import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Input } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ProfilePictureComponent } from '../profile-picture/profile-picture.component';
import { PictureComponent } from '../picture/picture.component';
import { BACKEND } from 'src/app/env';

@Component({
  selector: 'app-game-elem',
  standalone: true,
  imports: [CommonModule, HttpClientModule, PictureComponent],
  templateUrl: './game-elem.component.html',
  styleUrls: ['./game-elem.component.scss']
})


export class GameElemComponent {
	
	constructor	(public http: HttpClient) {}

	@Input() Gameid:number = 0;
	@Input() Userid:number = 0;
	@Input() otherId :number = 0;

	score1 :number = 0;
	score2 :number = 0;
	gameinfo :GameInfo
	won: boolean = false
	
	ngOnInit() {
		this.http.get<GameInfo>(BACKEND.URL + 'game/' + this.Gameid + '/info/').subscribe(
            res => {
				this.gameinfo = res;
				if (this.gameinfo.winnerId == this.Userid)
				{
					this.won = true
				}
				if (this.Userid == this.gameinfo.userId1)
				{
					this.score1 = this.gameinfo.scoreUser1;
					this.score2 = this.gameinfo.scoreUser2;
					this.otherId = this.gameinfo.userId2
				}
				else
				{
					this.score1 = this.gameinfo.scoreUser2;
                    this.score2 = this.gameinfo.scoreUser1;
                    this.otherId = this.gameinfo.userId1
				}
			},
			error => {
                console.log(error)
            })
	}

}

export class GameInfo {
	userId1: number = 0
	userId2: number = 0
	scoreUser1: number = 0
	scoreUser2: number = 0
	winnerId: number = 0
}