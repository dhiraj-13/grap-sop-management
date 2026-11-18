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
  flow = ['Draft', 'Submitted', 'Requested Modification', 'Modification In Progress', 'Resubmitted', 'Approved / Rejected'];
  
  // File preview state
  pdfUrl: SafeResourceUrl | null = null;
  upFileContent: string | null = null;
  upFileType: string | null = null;
  upFileName: string | null = null;
  upFileSize: string | null = null;

  constructor(public sopService: SopService, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.cur = this.sopService.getSopById(this.id)!;
    this.loadStoredFile(this.cur.id);
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

  get currentStepIndex(): number {
    const idx = this.flow.indexOf(this.cur.st);
    return idx >= 0 ? idx : 5;
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
