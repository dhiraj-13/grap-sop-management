import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SopService } from '../../services/sop.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  selectedPersona: 'Maker' | 'Reviewer' = 'Reviewer';
  @Output() loginSuccess = new EventEmitter<void>();

  constructor(public sopService: SopService) {}

  signIn() {
    this.sopService.currentUser.role = this.selectedPersona;
    this.loginSuccess.emit();
  }
}
