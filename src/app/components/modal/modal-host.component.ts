import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ModalService, ModalConfig } from './modal.service';
import { ModalComponent } from './modal.component';

@Component({
  selector: 'app-modal-host',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  template: `
    <app-modal
      *ngIf="modalState.isOpen"
      [config]="modalState.config!"
      [isOpen]="modalState.isOpen"
      (close)="onModalClose($event)">
    </app-modal>
  `,
  styles: [``]
})
export class ModalHostComponent implements OnInit, OnDestroy {
  modalState = {
    isOpen: false,
    config: null as ModalConfig | null
  };
  
  private subscription!: Subscription;

  constructor(private modalService: ModalService) {}

  ngOnInit() {
    this.subscription = this.modalService.modalState$.subscribe(state => {
      this.modalState = state;
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onModalClose(result: boolean) {
    this.modalService.close(result);
  }
}