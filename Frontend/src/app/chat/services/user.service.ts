import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { UserI } from 'src/app/chat/model/user.interface';
import { JwtHelperService } from '@auth0/angular-jwt';
import { RoomI } from '../model/room.interface';
import { BACKEND } from 'src/app/env';



@Injectable({
  providedIn: 'root'
})
export class UserService {

	constructor(private http: HttpClient, private snackbar: MatSnackBar,) { }
	users$: Observable<UserI[]>;
	helper = new JwtHelperService();

	// Pour option-user //
	private option = new BehaviorSubject<boolean>(false);
	option$ = this.option.asObservable();

	private user = new BehaviorSubject<UserI | undefined>(undefined);
	user$ = this.user.asObservable();

	private room = new BehaviorSubject<RoomI | undefined>(undefined);
	room$ = this.room.asObservable();
	//    *********   //

	findByLogin(login: string): Observable<UserI[]> {
		this.users$ = this.http.get<UserI[]>(BACKEND.URL + `users/find-by-login/${login}`)		
		return this.users$;
	}
	
	getLoggedInUser() {
		const decodedToken = this.helper.decodeToken(localStorage.getItem('access_token')!);
		return decodedToken;
	}

	changeOption(value: boolean, user: UserI | undefined) {
		this.option.next(value);
		if (value)
			this.user.next(user);
	}

	changeRoom(room: RoomI) {
		this.room.next(room)
	}

}
