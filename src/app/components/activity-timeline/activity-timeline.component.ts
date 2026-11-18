import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SopService, Sop, ActivityEntry } from '../../services/sop.service';

@Component({
  selector: 'app-activity-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-timeline.component.html',
  styleUrls: ['./activity-timeline.component.scss']
})
export class ActivityTimelineComponent implements OnInit {
  @Input() id!: string;
  @Output() close = new EventEmitter<void>();

  sop!: Sop;
  activities: ActivityEntry[] = [];

  constructor(private sopService: SopService) {}

  ngOnInit() {
    this.sop = this.sopService.getSopById(this.id)!;
    this.activities = this.sop.hist || [];
  }

  formatTimestamp(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(',', '');
    } catch {
      return timestamp;
    }
  }

  getActionIcon(action: string): string {
    const icons: {[key: string]: string} = {
      'Created': '📝',
      'Submitted': '📤',
      'Resubmitted': '🔄',
      'Approved': '✅',
      'Rejected': '❌',
      'Modification Requested': '✏️',
      'Modification In Progress': '⚙️',
      'New version uploaded': '📎'
    };
    return icons[action] || '📋';
  }

  getActionClass(action: string): string {
    const classes: {[key: string]: string} = {
      'Created': 'action-created',
      'Submitted': 'action-submitted',
      'Resubmitted': 'action-resubmitted',
      'Approved': 'action-approved',
      'Rejected': 'action-rejected',
      'Modification Requested': 'action-modification-requested',
      'Modification In Progress': 'action-modification-progress',
      'New version uploaded': 'action-new-version'
    };
    return classes[action] || 'action-default';
  }
}
