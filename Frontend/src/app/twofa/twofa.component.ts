import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ErrorModalComponent } from '../components/error-modal/error-modal.component';
import { BACKEND } from '../env';


@Component({
  selector: 'app-twofa',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule, MatFormFieldModule, ReactiveFormsModule, ErrorModalComponent],
  templateUrl: './twofa.component.html',
  styleUrls: ['./twofa.component.scss']
})
export class TwofaComponent {
  constructor(public http: HttpClient, private router: Router) {}
	public twofaForm = new FormGroup({
    code: new FormControl(null, [Validators.required]),
});

id: number = 0;
showError:boolean = false;
errorMessage:string =""

ngOnInit() {
	this.id = JSON.parse(localStorage.getItem('id')!);
	this.http.get(BACKEND.URL + 'auth/' + this.id + '/SendMail').subscribe()
}

get	code(): FormControl
{
	return this.twofaForm.get('code') as FormControl;
}

validate()
{
	this.http.post(BACKEND.URL + 'users/' + this.id + '/verify2facode', {code: this.code.value} ).subscribe(
		res => {
				localStorage.setItem('is_authenticated', 'true');
				this.router.navigate(['/home'])
		},
		err => {
			this.errorMessage = "Wrong code"
			this.openErrorModal()
			this.twofaForm.reset()
		}
	)

}

openErrorModal(): void {
	this.showError = true;
}
		
closeErrorModal(): void {
	this.showError = false;
}

}
