import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FriendlistComponent } from '../components/friendlist/friendlist.component';
import { HeaderbarComponent } from '../components/headerbar/headerbar.component';
import { ProfilePictureComponent } from '../components/profile-picture/profile-picture.component';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomSocket } from '../chat/sockets/custom-socket';
import { PictureComponent } from '../components/picture/picture.component';
import { FooterBarComponent } from '../components/footer-bar/footer-bar.component';
import { UserService } from '../chat/services/user.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FriendlistComponent, HeaderbarComponent, ProfilePictureComponent, HttpClientModule, PictureComponent, FooterBarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

	constructor(public http: HttpClient, private route:ActivatedRoute, private router: Router, private customSocket: CustomSocket, private userService: UserService) {}


	id:number = 0;

	code: string 
	ngOnInit() {
		this.id = JSON.parse(localStorage.getItem('id')!);
	}

	LaunchGame()
	{
		this.router.navigate(['game']);
	}
	
}
