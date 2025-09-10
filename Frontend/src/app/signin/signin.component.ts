import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { tap, throwError } from 'rxjs';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomValidators } from '../helpers/custom-validators';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RouterModule, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CustomSocket } from '../chat/sockets/custom-socket';
import { FooterBarComponent } from '../components/footer-bar/footer-bar.component';
import { ErrorModalComponent } from '../components/error-modal/error-modal.component';
import { BACKEND } from '../env';


@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, MatFormFieldModule, RouterModule, FooterBarComponent, ErrorModalComponent],
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent {
	constructor(public http: HttpClient, private router: Router) {}

	public signinForm = new FormGroup({
    	login: new FormControl(null, [Validators.required]),
    	password: new FormControl(null, [Validators.required]),
	});

	showError:boolean = false;
	errorMessage:string =""

    signin(): void {
		this.http.post<any>(BACKEND.URL + 'auth/signin', {login: this.login.value, password:this.password.value}).subscribe(
				res => {
					localStorage.setItem('access_token', res['access_token']);
					localStorage.setItem('id', JSON.stringify(res['id']));
					this.http.get<any>(BACKEND.URL + 'users/' + res['id'] + '/2faenabled').subscribe( res => {
						if (res === false)
						{
							localStorage.setItem('is_authenticated', 'true');
							this.router.navigate(['/home'])
						}
						else
						{
							this.router.navigate(['/twofa'])
						}

					})
				},
				err => {
					this.errorMessage = err.error.message
					this.openErrorModal();
				})
	}
	

	get	login(): FormControl
	{
		return this.signinForm.get('login') as FormControl;
	}

	get	password(): FormControl
	{
		return this.signinForm.get('password') as FormControl;
	}

	openErrorModal(): void {
		this.showError = true;
	}
			
	closeErrorModal(): void {
		this.showError = false;
	}
}