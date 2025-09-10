import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Input } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomValidators } from 'src/app/helpers/custom-validators';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ErrorModalComponent } from '../error-modal/error-modal.component';
import { BACKEND } from 'src/app/env';

@Component({
	selector: 'app-profile-picture',
	standalone: true,
	imports: [CommonModule, HttpClientModule, ReactiveFormsModule, MatFormFieldModule, ErrorModalComponent],
	templateUrl: './profile-picture.component.html',
	styleUrls: ['./profile-picture.component.scss']
})
export class ProfilePictureComponent {
	
	constructor(public http: HttpClient, private location: Location, private router: Router) {}
	public editNameForm = new FormGroup({
		Nickname: new FormControl(null, [Validators.required]),
	
	},
	{validators: [CustomValidators.nicktoolong]});
	
	@Input() id:number = 0;
	name:string = '';
	avatar: any ;
	showModal = false;
	showError:boolean = false;
	errorMessage:string =""
	
	ngOnInit() {
        this.retrieveUser();
	}

	retrieveUser() {
	 this.http.get<any>(BACKEND.URL + "users/" + this.id).subscribe (
		res => {
			this.name = res['login'];
		},
		err => {
		})
		this.get_avatar().subscribe (data => {
			this.createImageFromBlob(data)
		})
	}

	createImageFromBlob(image: Blob) {
		let reader = new FileReader();
		reader.addEventListener("load", () => {
			this.avatar = reader.result;
		 }, false);

		if (image) {
		   reader.readAsDataURL(image);
		}
	 }

	get_avatar() {
		return this.http.get<Blob>(BACKEND.URL + "users/" + this.id + "/avatar", { responseType: 'Blob' as 'json' })
	}

	get	Nickname(): FormControl
	{
		return this.editNameForm.get('Nickname') as FormControl;
	}

	selectedFile: File

	onFileChanged(event) {
	  this.selectedFile = event.target.files[0]

	  const url = BACKEND.URL + "users/" + this.id + "/upload";
	  
		const formData = new FormData();
		formData.append('file', this.selectedFile);
	  
		this.http.post<any>(url, formData).subscribe({
		  next: (data: any) => this.router.navigateByUrl('/Home',{skipLocationChange:true}).then(()=>{
			this.router.navigate([window.location.pathname]).then(()=>{
			})
		}),
		  error: (error: any) => {
			this.errorMessage = error.error.message
			this.openErrorModal();}
		})
	}


	toggleModal(){
	  this.showModal = !this.showModal;
	}
	
	editName(){
		this.toggleModal()
		this.http.patch(BACKEND.URL + "users/" + this.id + "/editName", {userName:this.editNameForm.value.Nickname}).subscribe(
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
		this.editNameForm.reset();
    }
	
	closeButton(){
		this.editNameForm.reset(); 
		this.toggleModal()
	}

	enterKey(){
		this.editName()
	  }

	openErrorModal(): void {
	this.showError = true;
	}
	
	closeErrorModal(): void {
		this.showError = false;
	}
}
