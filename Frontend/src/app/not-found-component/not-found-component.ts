import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './not-found-component.html',
  styleUrls: ['./not-found-component.scss']
})
export class NotFoundComponent {
	constructor(public router: Router) { }

}
