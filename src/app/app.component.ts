import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './components/login/login.component';
import { ListingComponent } from './components/listing/listing.component';
import { AddEditSopComponent } from './components/add-edit-sop/add-edit-sop.component';
import { ReviewSopComponent } from './components/review-sop/review-sop.component';
import { ActivityTimelineComponent } from './components/activity-timeline/activity-timeline.component';
import { SopService } from './services/sop.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    LoginComponent, 
    ListingComponent, 
    AddEditSopComponent, 
    ReviewSopComponent, 
    ActivityTimelineComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isLoggedIn = false;
  currentPage: 'list' | 'form' | 'review' | 'activity' = 'list';
  editId: string | null = null;
  canReview: boolean = false;
  activityId: string | null = null;
  toastMsg: string | null = null;
  showNotif = false;

  constructor(public sopService: SopService) {}

  onLogin() {
    this.isLoggedIn = true;
    this.currentPage = 'list';
  }

  onSignOut() {
    this.isLoggedIn = false;
  }

  onNavigate(event: {page: string, id?: string, canAct?: boolean}) {
    if (event.page === 'activity') {
      this.activityId = event.id || null;
    } else {
      this.currentPage = event.page as any;
      this.editId = event.id || null;
      this.canReview = event.canAct || false;
    }
  }

  showToast(msg: string) {
    this.toastMsg = msg;
    setTimeout(() => this.toastMsg = null, 2600);
  }
}
