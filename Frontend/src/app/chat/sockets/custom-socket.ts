import { Injectable } from '@angular/core';
import { Socket, SocketIoConfig } from 'ngx-socket-io';
import { tokenGetter } from 'src/app/app.config';
import { BACKEND } from 'src/app/env';


const config: SocketIoConfig = {
	url: BACKEND.URL, options: {
	  extraHeaders: {
		Authorization: tokenGetter()
	  }
	}
  };


@Injectable({providedIn: 'root'})
export class CustomSocket extends Socket {
	
	constructor() { super(config) }

	configSocket() {
		const config: SocketIoConfig = {
			url: BACKEND.URL, options: {
			  extraHeaders: {
				Authorization: tokenGetter()
			  }
			}
		  };
		}
}