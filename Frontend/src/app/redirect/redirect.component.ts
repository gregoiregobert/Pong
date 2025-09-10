import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CustomSocket } from '../chat/sockets/custom-socket';
import { BACKEND } from '../env';

@Component({
  selector: 'app-redirect',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule],
  templateUrl: './redirect.component.html',
  styleUrls: ['./redirect.component.scss']
})
export class RedirectComponent {
  constructor(public http: HttpClient, private route: ActivatedRoute, private router: Router) {}

  id: number = 0
  code: any
  ngOnInit()
	{
		this.route.queryParams.subscribe(params => {
			this.code = params['code'];
		})
    try {
			this.http.post(BACKEND.URL + "auth/42redirect", {code: this.code}).subscribe(
				response => {
          localStorage.setItem('access_token', response['token']['access_token'])
          localStorage.setItem('id', response['token']['id'])
		  this.id = response['token']['id']
          this.http.get<any>(BACKEND.URL + 'users/' + this.id + '/2faenabled').subscribe( res => {
			  		if (response['isalreadyregistered'] === true)
					{
						if (res === true)
							this.router.navigate(['/twofa'])
						else
						{
							localStorage.setItem('is_authenticated', 'true');
							this.router.navigate(['/home'])
						}
					}
					else
						this.router.navigate(['/edit'])
					})
				},
				error => {
					console.log(error)
					this.redirect_timer()
					
				}
			)
		}
		catch (err) {
			console.log(err)
			this.redirect_timer()
		}
	}

	redirect_timer()
	{
		if (localStorage.getItem('access_token'))
		{
			setTimeout(() => {
				this.router.navigate(['/home']);
			}, 2000);
		}
		else
		{
				setTimeout(() => {
					this.router.navigate(['/landing']);
				}, 2000);
		}
	}
}
