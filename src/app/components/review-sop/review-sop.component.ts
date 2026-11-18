import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SopService, Sop } from '../../services/sop.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

const FILE_STORAGE_KEY = 'grap_sop_files';

@Component({
  selector: 'app-review-sop',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-sop.component.html',
  styleUrls: ['./review-sop.component.scss']
})
export class ReviewSopComponent implements OnInit {
  @Input() id!: string;
  @Input() canAct: boolean = false;
  @Output() back = new EventEmitter<void>();
  @Output() notify = new EventEmitter<string>();
  @Output() openActivity = new EventEmitter<string>();

  cur!: Sop;
  docTab: 'doc' | 'cmp' = 'doc';
  remarks: string = '';
  
  // File preview state
  pdfUrl: SafeResourceUrl | null = null;
  upFileContent: string | null = null;
  upFileType: string | null = null;
  upFileName: string | null = null;
  upFileSize: string | null = null;

  // Dynamic flow based on SOP history
  flow: string[] = [];
  flowStatus: ('completed' | 'current' | 'pending' | 'skipped')[] = [];

  constructor(public sopService: SopService, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.cur = this.sopService.getSopById(this.id)!;
    this.loadStoredFile(this.cur.id);
    this.computeFlow();
  }

  computeFlow() {
    if (!this.cur || !this.cur.hist) {
      this.flow = ['Draft'];
      this.flowStatus = ['current'];
      return;
    }

    // Get unique statuses from history in order
    const statusesInHistory = this.cur.hist
      .map(h => h.statusAfter)
      .filter((status, index, arr) => arr.indexOf(status) === index);

    // Define the standard workflow
    const standardFlow = [
      'Draft',
      'Submitted',
      'Requested Modification',
      'Modification In Progress',
      'Resubmitted',
      'Approved',
      'Rejected'
    ];

    // Build flow based on actual history
    const currentStatus = this.cur.st;
    const hasBeenRejected = statusesInHistory.includes('Rejected');
    const hasBeenApproved = statusesInHistory.includes('Approved');
    const hasModification = statusesInHistory.some(s => s.includes('Modification'));

    // Start with Draft
    this.flow = ['Draft'];
    this.flowStatus = ['completed'];

    // Add Submitted if it exists in history or is current
    if (statusesInHistory.includes('Submitted') || currentStatus === 'Submitted') {
      this.flow.push('Submitted');
      this.flowStatus.push(currentStatus === 'Submitted' ? 'current' : 'completed');
    }

    // Add modification cycle if it exists
    if (hasModification) {
      if (statusesInHistory.includes('Requested Modification')) {
        this.flow.push('Requested Modification');
        this.flowStatus.push(currentStatus === 'Requested Modification' ? 'current' : 'completed');
      }
      if (statusesInHistory.includes('Modification In Progress')) {
        this.flow.push('Modification In Progress');
        this.flowStatus.push(currentStatus === 'Modification In Progress' ? 'current' : 'completed');
      }
      if (statusesInHistory.includes('Resubmitted') || currentStatus === 'Resubmitted') {
        this.flow.push('Resubmitted');
        this.flowStatus.push(currentStatus === 'Resubmitted' ? 'current' : 'completed');
      }
    }

    // Add final status
    if (hasBeenApproved) {
      this.flow.push('Approved');
      this.flowStatus.push(currentStatus === 'Approved' ? 'current' : 'completed');
    } else if (hasBeenRejected) {
      this.flow.push('Rejected');
      this.flowStatus.push(currentStatus === 'Rejected' ? 'current' : 'completed');
    } else if (currentStatus === 'Approved' || currentStatus === 'Rejected') {
      this.flow.push(currentStatus);
      this.flowStatus.push('current');
    } else if (this.flow.length > 0) {
      // Add pending final step if not terminal
      const lastStatus = this.flow[this.flow.length - 1];
      if (lastStatus === 'Submitted' || lastStatus === 'Resubmitted') {
        this.flow.push('Approved / Rejected');
        this.flowStatus.push('pending');
      } else if (lastStatus === 'Modification In Progress') {
        this.flow.push('Resubmitted');
        this.flowStatus.push('pending');
      }
    }

    // Ensure current status is marked correctly
    const currentIdx = this.flow.indexOf(currentStatus);
    if (currentIdx >= 0) {
      this.flowStatus = this.flowStatus.map((s, i) => i === currentIdx ? 'current' : (i < currentIdx ? 'completed' : 'pending'));
    }
  }

  loadStoredFile(sopId: string) {
    try {
      const stored = localStorage.getItem(FILE_STORAGE_KEY);
      if (stored) {
        const files = JSON.parse(stored);
        if (files[sopId]) {
          this.upFileContent = files[sopId].content;
          this.upFileName = files[sopId].name;
          this.upFileType = files[sopId].type;
          this.upFileSize = files[sopId].size;
          this.loadPreview();
        }
      }
    } catch (e) {
      console.error('Error loading stored file:', e);
    }
  }

  loadPreview() {
    if (this.upFileType === 'pdf' && this.upFileContent) {
      this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.upFileContent);
    } else {
      this.pdfUrl = null;
    }
  }

  addR(t: string) {
    this.remarks = t;
  }

  decide(d: 'Approved' | 'Rejected' | 'Requested Modification') {
    if (d !== 'Approved' && !this.remarks.trim()) {
      this.notify.emit('Please enter remarks');
      return;
    }
    const msg = d === 'Approved' ? 'Approve and publish this SOP to the knowledge base?' : d === 'Rejected' ? 'Reject this SOP?' : 'Send back to the creator for changes?';
    if (!confirm(msg)) return;

    const action = d === 'Approved' ? 'approve' : d === 'Rejected' ? 'reject' : 'request-modification';
    const success = this.sopService.performAction(this.cur.id, action, this.remarks);
    
    if (success) {
      this.notify.emit(d === 'Approved' ? `✅ ${this.cur.id} approved and published` : `${this.cur.id} ${d.toLowerCase()}`);
      this.back.emit();
    }
  }
}
