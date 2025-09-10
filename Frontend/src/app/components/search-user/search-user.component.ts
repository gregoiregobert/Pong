import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import {Router, RouterModule } from '@angular/router';
import { ErrorModalComponent } from '../error-modal/error-modal.component';
import { BACKEND } from 'src/app/env';

@Component({
  selector: 'app-search-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, RouterModule, ErrorModalComponent],
  templateUrl: './search-user.component.html',
  styleUrls: ['./search-user.component.scss']
})
export class SearchUserComponent {

	constructor(public http: HttpClient, private router: Router) {};

	public SearchForm = new FormGroup({
		name: new FormControl(null, [Validators.required])
	});

	showModal = false;
	showError:boolean = false;
	errorMessage:string =""

	toggleModal(){
	  this.showModal = !this.showModal;
	}
	
	searchUser(){
		this.toggleModal()
		this.http.get(BACKEND.URL + "users/" + this.SearchForm.value.name + '/id').subscribe(
			res => {
				this.http.get(BACKEND.URL + "users/" + localStorage.getItem('id') + '/search').subscribe()
				this.router.navigate(['/user'],  { queryParams: { id: res } })
			},
            err => {
				this.errorMessage = err.error.message
				this.openErrorModal();
			}
			);
		this.SearchForm.reset();
    }
	
	closeButton(){
		this.SearchForm.reset(); 
		this.toggleModal()
	}

	enterKey(){
		this.searchUser()
	  }

	openErrorModal(): void {
	this.showError = true;
	}
		
	closeErrorModal(): void {
		this.showError = false;
	}
}
