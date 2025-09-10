import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { UserI } from 'src/app/chat/model/user.interface';
import { FormControl } from '@angular/forms';
import { Observable, debounceTime, distinctUntilChanged, of, switchMap, take, tap } from 'rxjs';
import { UserService } from 'src/app/chat/services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-select-users',
  standalone: true,
  imports: [
	CommonModule,
	MatFormFieldModule,
	MatInputModule,
	MatAutocompleteModule,
	MatOptionModule,
	MatChipsModule,
	FormsModule,
	MatIconModule,
	ReactiveFormsModule],
  templateUrl: './select-users.component.html',
  styleUrls: ['./select-users.component.scss'],
})
export class SelectUsersComponent implements OnInit, OnChanges{

	@Input() users: UserI[] | null = null;
	@Input() public: boolean;
	@Output() addUser: EventEmitter<UserI> = new EventEmitter<UserI>();
	@Output() removeuser: EventEmitter<UserI> = new EventEmitter<UserI>();

	searchLogin = new FormControl();
	filteredUsers: UserI[] = [];
	selectedUser: UserI | null = null;
	currentUserId;
	
	constructor( private userService: UserService, private socketService: SocketService ) {}

	
	ngOnChanges(changes: SimpleChanges): void {
		if (changes['public']) {
		  if (changes['public'].currentValue) {
			this.searchLogin.disable();
		  } else {
			this.searchLogin.enable();
		  }
		}
	  }

	ngOnInit() : void {
		if (this.public)
			this.searchLogin.disable();

		this.currentUserId = JSON.parse(localStorage.getItem('id')!);

		this.searchLogin.valueChanges.pipe(
			debounceTime(500),
			distinctUntilChanged(),
			switchMap((login: string) => {
				if ( !login ) {
					this.filteredUsers = []
					return of([])
				}
				return this.userService.findByLogin(login).pipe(
					tap((users: UserI[]) => {
						this.filteredUsers = users.filter(user =>
							user.id !== this.currentUserId 
						);
					})
				)
			})
		).subscribe();
	}
			
			
	addUserToForm() {
		if (this.selectedUser !== null) {
			this.addUser.emit(this.selectedUser);
		}
		this.filteredUsers = [];
		this.selectedUser = null;
		this.searchLogin.setValue(null);
	}
	
	
	removeUserFromForm(user: UserI) {
		this.removeuser.emit(user);
	}
	
	setSelectedUser(user: any) {
		this.selectedUser = user;
	}
	
	displayFn(user: UserI | undefined): string {
		if (user && user.login) {
			return user.login;
		} else {
			return '';
		}
	}
		}
		
		