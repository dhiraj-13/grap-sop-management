import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './components/login/login.component';
import { ListingComponent } from './components/listing/listing.component';
import { AddEditSopComponent } from './components/add-edit-sop/add-edit-sop.component';
import { ReviewSopComponent } from './components/review-sop/review-sop.component';
import { ActivityTimelineComponent } from './components/activity-timeline/activity-timeline.component';
import { ModalHostComponent } from './components/modal/modal-host.component';
import { SopService, Notification } from './services/sop.service';
import { ConstantsService } from './shared/constants.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    LoginComponent,
    ListingComponent,
    AddEditSopComponent,
    ReviewSopComponent,
    ActivityTimelineComponent,
    ModalHostComponent
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

  constructor(public sopService: SopService, public constants: ConstantsService) {}

  onLogin() {
    this.isLoggedIn = true;
    this.currentPage = 'list';
  }

  onSignOut() {
    this.isLoggedIn = false;
    this.showNotif = false;
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
    setTimeout(() => this.toastMsg = null, this.constants.toastDurationMs)
  }

  get notifications(): Notification[] {
    return this.sopService.getNotifications();
  }

  get unreadCount(): number {
    return this.sopService.getUnreadNotificationCount();
  }

  toggleNotifications() {
    this.showNotif = !this.showNotif;
  }

  markAsRead(id: string) {
    this.sopService.markNotificationAsRead(id);
  }

  markAllRead() {
    this.sopService.markAllNotificationsAsRead();
    this.showNotif = false;
  }

  closeNotifications() {
    this.showNotif = false;
  }

  formatNotificationTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} h ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getNotificationIcon(type: string): string {
    const icons: {[key: string]: string} = {
      'info': '📥',
      'success': '✅',
      'warning': '✏️',
      'error': '❌'
    };
    return icons[type] || '🔔';
  }

  getNotificationClass(type: string): string {
    return `notif-${type}`;
  }
}
