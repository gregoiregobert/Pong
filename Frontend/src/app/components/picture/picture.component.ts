import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Input } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ErrorModalComponent } from '../error-modal/error-modal.component';
import { BACKEND } from 'src/app/env';

@Component({
  selector: 'app-picture',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ErrorModalComponent],
  templateUrl: './picture.component.html',
  styleUrls: ['./picture.component.scss']
})
export class PictureComponent {
	constructor(public http: HttpClient, private location: Location) {}

	@Input() id:number = 0;
	name:string = '';
	avatar: any ;
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
			this.errorMessage = "User doesn't exist"
			this.openErrorModal();
			this.location.back()
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

	openErrorModal(): void {
		this.showError = true;
	  }
	
	closeErrorModal(): void {
		this.showError = false;
	}
}
