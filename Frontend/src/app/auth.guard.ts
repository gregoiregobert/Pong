import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

import { HttpClientModule, HttpClient } from '@angular/common/http';
import { BACKEND } from './env';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor( private readonly router: Router, private http: HttpClient) {}
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (!localStorage.getItem('access_token') || !localStorage.getItem('id') || !localStorage.getItem('is_authenticated'))
	{
      localStorage.clear();
      this.router.navigateByUrl('/landing');
      return false;
    }
    try {
      this.check_token(localStorage.getItem('access_token'), parseInt(localStorage.getItem('id') || '{}')).subscribe({
        next: (val) => {
          if (!val) {
		      	localStorage.clear();
            this.router.navigateByUrl('/landing');
            return false;

          }
          return true;
        },
        error: (e) => {
          localStorage.clear();
          this.router.navigateByUrl('/landing');
          return false;
        },
      });
      this.check_2fastatus(localStorage.getItem('id')).subscribe({
        next: (val) => {
          if (!val) {
		      	localStorage.clear();
            this.router.navigateByUrl('/landing');
            return false;

          }
          return true;
        },
        error: (e) => {
          localStorage.clear();
          this.router.navigateByUrl('/landing');
          return false;
        },
      });
    }
	catch (e) {
      console.log('An error occured : ', e);
      localStorage.clear();
      this.router.navigateByUrl('/landing');
      return false;
    }
    return true;
  }

  check_token(token, id) {
    return this.http.post(BACKEND.URL + "auth/check", {token: token, id: id})
	}

  check_2fastatus(id)
  {
    return this.http.get(BACKEND.URL + "auth/" + id + "/check2fa")
  }
}
