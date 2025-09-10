import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { BACKEND } from '../env';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})

export class LandingPageComponent {

	constructor(public http: HttpClient) {}
	code: any
	redirect_url : string = ""
	ngOnInit()
	{
		this.http.get( BACKEND.URL + 'auth/geturl').subscribe(
			res => {
				this.redirect_url = res['url']
			},
			err => {
				console.log(err)
			}
		)
	}
}
