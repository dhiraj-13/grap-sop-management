import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SopService, Sop } from '../../services/sop.service';

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
  history: any[] = [];

  constructor(private sopService: SopService) {}

  ngOnInit() {
    this.sop = this.sopService.getSops().find(s => s.id === this.id)!;
    this.history = this.sop.hist || [
      ['10 Nov 2026 10:00', 'Created', '—', 'Draft', 'v1', this.sop.byn, ''],
      ...(this.sop.st !== 'Draft' ? [['11 Nov 2026 15:20', 'Submitted', 'Draft', 'Submitted', 'v1', this.sop.byn, '']] : []),
      ...(this.sop.remark ? [[this.sop.up + ' 11:45', this.sop.st === 'Rejected' ? 'Rejected' : 'Modification requested', 'Submitted', this.sop.st === 'Rejected' ? 'Rejected' : 'Requested Modification', 'v' + this.sop.v, this.sop.rby, this.sop.remark]] : []),
      ...(this.sop.st === 'Resubmitted' ? [['16 Nov 2026 09:10', 'Resubmitted', 'Modification In Progress', 'Resubmitted', 'v' + this.sop.v, this.sop.byn, 'Added escalation matrix']] : [])
    ];
  }

  get reversedHistory() {
    return [...this.history].reverse();
  }
}
