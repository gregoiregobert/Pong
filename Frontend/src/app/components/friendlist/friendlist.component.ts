import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FriendComponent } from '../friend/friend.component';
import { AddFriendComponent } from '../add-friend/add-friend.component';
import { SearchUserComponent } from '../search-user/search-user.component';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { BACKEND } from 'src/app/env';

@Component({
  selector: 'app-friendlist',
  standalone: true,
  imports: [CommonModule, FriendComponent, AddFriendComponent, HttpClientModule, SearchUserComponent],
  templateUrl: './friendlist.component.html',
  styleUrls: ['./friendlist.component.scss']
})
export class FriendlistComponent {
	constructor(public http:HttpClient){}

	@Input() id:number = 0;
	friendList :number[] = []

	ngOnInit() {
		this.http.get<number[]>(BACKEND.URL + "users/" + this.id + "/friendlist").subscribe(res => {
			this.friendList = res;
	})
	
		}

}

