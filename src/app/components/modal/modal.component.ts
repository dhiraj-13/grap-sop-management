import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalConfig } from './modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
  @Input() config!: ModalConfig;
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<boolean>(); // true = confirmed, false = cancelled

  modalIcon: string = '';
  modalClass: string = '';

  ngOnInit() {
    this.setIconAndClass();
  }

  ngOnChanges() {
    this.setIconAndClass();
  }

  private setIconAndClass() {
    switch (this.config.type) {
      case 'confirm':
        this.modalIcon = this.config.icon || '';
        this.modalClass = 'modal-confirm';
        break;
      case 'alert':
        this.modalIcon = this.config.icon || '';
        this.modalClass = 'modal-alert';
        break;
      case 'info':
        this.modalIcon = this.config.icon || '';
        this.modalClass = 'modal-info';
        break;
      case 'success':
        this.modalIcon = this.config.icon || '';
        this.modalClass = 'modal-success';
        break;
      case 'warning':
        this.modalIcon = this.config.icon || '';
        this.modalClass = 'modal-warning';
        break;
      case 'error':
        this.modalIcon = this.config.icon || '';
        this.modalClass = 'modal-error';
        break;
    }
  }

  onConfirm() {
    this.close.emit(true);
  }

  onCancel() {
    this.close.emit(false);
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.onCancel();
    } else if (event.key === 'Enter' && this.config.type === 'confirm') {
      this.onConfirm();
    }
  }
}