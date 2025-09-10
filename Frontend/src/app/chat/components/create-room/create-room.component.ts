import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UserI } from 'src/app/chat/model/user.interface';
import { ChatService } from '../../services/chat.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SelectUsersComponent } from 'src/app/chat/components/select-users/select-users.component'

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox'; 

import { RouterModule } from '@angular/router';
import { SocketService } from '../../services/socket.service';
import { Observable, Subscription, take } from 'rxjs';
import { CustomSocket } from '../../sockets/custom-socket';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-create-room',
  standalone: true,
  imports: [ ReactiveFormsModule, FormsModule, CommonModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatCardModule, MatCheckboxModule, RouterModule, SelectUsersComponent ],
  templateUrl: './create-room.component.html',
  styleUrls: ['./create-room.component.scss']
})
export class CreateRoomComponent implements OnInit, OnDestroy {

	form: FormGroup = new FormGroup({
		name: new FormControl(null, [Validators.required]),
		description: new FormControl(null),
		users: new FormArray([],[Validators.required]),
		public: new FormControl(false),
		password: new FormControl({value: null, disabled: true }),
		isPass: new FormControl(false),
	});
	currentUser$: Observable<UserI> = this.socketService.user;
	
	subExist: Subscription;

	constructor(private chatService: ChatService,
				private router: Router,
				private socketService: SocketService,
				private socket: CustomSocket,
				private snackbar: MatSnackBar) {}
	
	ngOnInit() {

		this.form.get('password')?.valueChanges.subscribe((password) => {
			this.form.patchValue({ isPass: !!password });
			// console.log('isPass:', this.form.get('isPass')?.value);
		});

		this.subExist = this.socket.fromEvent<boolean>("roomExisting").subscribe((value) => {
			if (value)
				this.snackbar.open(`Room ${this.name.value} already exists`, 'Close' ,{
					duration: 3000, horizontalPosition: 'right', verticalPosition: 'top'
				});
		});
	}

	ngOnDestroy(): void {
		if (this.subExist)
			this.subExist.unsubscribe();
	}

	create() {
		if (this.form.valid) {
			this.chatService.createRoom(this.form.getRawValue());
			this.router.navigate(["../chat"]);
		}
	}

	initUser(user: UserI) {
		return new FormControl({
			id: user.id,
			login: user.login,
			email: user.email
		});
	}

	onCheckboxChange() {
		if (this.form.value.public) {
			this.form.get('password')?.enable();
			this.form.get('users')?.clearValidators();
			this.form.get('users')?.updateValueAndValidity();
			this.form.get('users')?.setValue([]);
		} else {
			this.form.get('password')?.disable();
			this.form.get('users')?.setValidators([Validators.required]);
			this.form.get('users')?.updateValueAndValidity();
		}
	  }

	addUser(userFormControl: FormControl) {
		const usersArray = this.form.get('users') as FormArray;
		usersArray.push(userFormControl);
	  }

	removeUser(userId: number | undefined) {
		const usersArray = this.form.get('users') as FormArray;
		const indexToRemove = usersArray.value.findIndex((user: UserI) => user.id === userId);
		if (indexToRemove !== -1) {
		  usersArray.removeAt(indexToRemove);
		}
	}

	get name(): FormControl {
		return this.form.get('name') as FormControl;
	}

	get description(): FormControl {
		return this.form.get('description') as FormControl;
	}

	get users(): FormControl {
		return this.form.get('users') as FormControl;
	}

	get public(): FormControl {
		return this.form.get('public') as FormControl;
	}

	goToDashboard() {
		this.router.navigate(['chat']);
	}
}
