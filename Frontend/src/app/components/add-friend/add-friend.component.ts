import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ErrorModalComponent } from '../error-modal/error-modal.component';
import { BACKEND } from 'src/app/env';
import { Router } from '@angular/router';


@Component({
  selector: 'app-add-friend',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, ErrorModalComponent],
  templateUrl: './add-friend.component.html',
  styleUrls: ['./add-friend.component.scss']
})
export class AddFriendComponent {

	constructor(public http: HttpClient, private router: Router) {};

	public AddFriendForm = new FormGroup({
		name: new FormControl(null, [Validators.required])
	});

	showError:boolean = false;
	errorMessage:string =""
	showModal = false;
	@Input() id:number = 0;

	toggleModal(){
	  this.showModal = !this.showModal;
	}
	
	addFriend(){
		this.toggleModal()
		this.http.patch(BACKEND.URL + "users/" + this.id + "/AddFriend", {userName:this.AddFriendForm.value.name}).subscribe(
			res => {
				this.router.navigateByUrl('/Home',{skipLocationChange:true}).then(()=>{
					this.router.navigate([window.location.pathname]).then(()=>{
					})
				})
			},
            err => {
				this.errorMessage = err.error.message
				this.openErrorModal();
			}
			);
		this.AddFriendForm.reset();
    }
	
	closeButton(){
		this.AddFriendForm.reset(); 
		this.toggleModal()
	}

	enterKey(){
		this.addFriend()
	  }

	openErrorModal(): void {
	this.showError = true;
	}
	
	closeErrorModal(): void {
		this.showError = false;
	}
}
