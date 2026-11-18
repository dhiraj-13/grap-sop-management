import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SopService, Sop } from '../../services/sop.service';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { ModalService } from '../modal/modal.service';
import { FileStorageService } from '../../shared/file-storage.service';
import * as mammoth from 'mammoth';
import * as XLSX from 'xlsx';

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
  wordPreviewHtml: SafeHtml | null = null;
  excelPreviewHtml: SafeHtml | null = null;
  upFileContent: string | null = null;
  upFileType: string | null = null;
  upFileName: string | null = null;
  upFileSize: string | null = null;

  // Dynamic flow based on SOP history
  flow: string[] = [];
  flowStatus: ('completed' | 'current' | 'pending' | 'skipped')[] = [];

  constructor(
    public sopService: SopService, 
    private sanitizer: DomSanitizer, 
    private modalService: ModalService,
    private fileStorage: FileStorageService
  ) {}

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
    const file = this.fileStorage.loadStoredFile(sopId);
    if (file) {
      this.upFileContent = file.content;
      this.upFileName = file.name;
      this.upFileType = file.type;
      this.upFileSize = file.size;
      this.loadPreview();
    }
  }

  loadPreview() {
    // Reset all previews
    this.pdfUrl = null;
    this.wordPreviewHtml = null;
    this.excelPreviewHtml = null;

    if (!this.upFileContent || !this.upFileType) return;

    if (this.fileStorage.isPdf(this.upFileType)) {
      this.pdfUrl = this.fileStorage.createPdfUrl(this.upFileContent);
    } else if (this.isWordDocx(this.upFileType)) {
      this.generateWordPreview();
    } else if (this.isExcel(this.upFileType)) {
      this.generateExcelPreview();
    }
  }

  private isWordDocx(type: string): boolean {
    return type === 'docx';
  }

  private isExcel(type: string): boolean {
    return type === 'xls' || type === 'xlsx';
  }

  private async generateWordPreview() {
    if (!this.upFileContent) return;
    try {
      // Convert base64 to ArrayBuffer
      const arrayBuffer = this.base64ToArrayBuffer(this.upFileContent);
      const result = await mammoth.convertToHtml({ arrayBuffer });
      this.wordPreviewHtml = this.sanitizer.bypassSecurityTrustHtml(result.value);
    } catch (error) {
      console.error('Word preview error:', error);
      this.wordPreviewHtml = this.sanitizer.bypassSecurityTrustHtml('<p class="hint">Unable to preview Word document</p>');
    }
  }

  private async generateExcelPreview() {
    if (!this.upFileContent) return;
    try {
      // Convert base64 to ArrayBuffer
      const arrayBuffer = this.base64ToArrayBuffer(this.upFileContent);
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Get first sheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert to HTML table
      const html = XLSX.utils.sheet_to_html(worksheet, { editable: false });
      this.excelPreviewHtml = this.sanitizer.bypassSecurityTrustHtml(html);
    } catch (error) {
      console.error('Excel preview error:', error);
      this.excelPreviewHtml = this.sanitizer.bypassSecurityTrustHtml('<p class="hint">Unable to preview Excel document</p>');
    }
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    // Remove data URL prefix if present
    const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

getFileTypeDescription(type: string | null): string {
  const descriptions: { [key: string]: string } = {
    'pdf': 'PDF',
    'doc': 'Word',
    'docx': 'Word',
    'xls': 'Excel',
    'xlsx': 'Excel',
    'ppt': 'PowerPoint',
    'pptx': 'PowerPoint',
    'txt': 'Text',
    'csv': 'CSV',
    'rtf': 'Rich Text',
    'odt': 'OpenDocument Text',
    'ods': 'OpenDocument Spreadsheet',
    'odp': 'OpenDocument Presentation'
  };
  return descriptions[type?.toLowerCase() || ''] || 'Document';
}

addR(t: string) {
    this.remarks = t;
  }

  async decide(d: 'Approved' | 'Rejected' | 'Requested Modification') {
    if (d !== 'Approved' && !this.remarks.trim()) {
      this.notify.emit('Please enter remarks');
      return;
    }
    
    const config = {
      title: d === 'Approved' ? 'Approve SOP' : d === 'Rejected' ? 'Reject SOP' : 'Request Modification',
      message: d === 'Approved' 
        ? 'Approve and publish this SOP to the knowledge base?' 
        : d === 'Rejected' 
          ? 'Reject this SOP? This action cannot be undone.' 
          : 'Send back to the creator for changes?',
      type: 'confirm' as const,
      confirmText: d === 'Approved' ? 'Approve & Publish' : d === 'Rejected' ? 'Reject' : 'Request Changes',
      cancelText: 'Cancel',
      showCancel: true
    };
    
    const confirmed = await this.modalService.show(config);
    if (!confirmed) return;

    const action = d === 'Approved' ? 'approve' : d === 'Rejected' ? 'reject' : 'request-modification';
    const success = this.sopService.performAction(this.cur.id, action, this.remarks);
    
    if (success) {
      this.notify.emit(d === 'Approved' ? `✅ ${this.cur.id} approved and published` : `${this.cur.id} ${d.toLowerCase()}`);
      this.back.emit();
    }
  }
}
