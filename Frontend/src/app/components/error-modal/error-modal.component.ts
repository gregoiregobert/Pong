import { Component, Input, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-error-modal',
  standalone: true,
  imports: [],
  templateUrl: './error-modal.component.html',
  styleUrl: './error-modal.component.scss'
})
export class ErrorModalComponent {
  @Input() title: string = 'Error';
  @Input() message: string = 'An error occured';
  @Output() onClose: EventEmitter<void> = new EventEmitter<void>();

  closeModal(): void {
    this.onClose.emit(); 
  }

  

}
