import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameElemComponent } from '../game-elem/game-elem.component';
import { Input } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { BACKEND } from 'src/app/env';

@Component({
  selector: 'app-gamehistory',
  standalone: true,
  imports: [CommonModule, GameElemComponent, HttpClientModule],
  templateUrl: './gamehistory.component.html',
  styleUrls: ['./gamehistory.component.scss']
})
export class GamehistoryComponent {

	constructor(public http: HttpClient) { }

	@Input() id:number = 0;
	GameHistory :number[] = []

	ngOnInit() {
		this.http.get<number[]>(BACKEND.URL + "game/" + this.id + "/GameHistory").subscribe(res => {
			this.GameHistory = res
		},
		err => {
			console.log(err);
		})
	}

}
