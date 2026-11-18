import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { SopService, Sop } from '../../services/sop.service';
import { CustomDropdownComponent, DropdownOption } from '../custom-dropdown/custom-dropdown.component';
import { FileStorageService } from '../../shared/file-storage.service';
import { ConstantsService } from '../../shared/constants.service';
import * as mammoth from 'mammoth';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-add-edit-sop',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomDropdownComponent],
  templateUrl: './add-edit-sop.component.html',
  styleUrls: ['./add-edit-sop.component.scss']
})
export class AddEditSopComponent implements OnInit {
  @Input() editId: string | null = null;
  @Output() back = new EventEmitter<void>();
  @Output() notify = new EventEmitter<string>();

  sopForm!: FormGroup;
  subcategories: string[] = [];
  categories = Object.keys(this.sopService.cats);
  
  categoryOptions: DropdownOption[] = [];
  subcategoryOptions: DropdownOption[] = [];
  
  // File upload state
  upFile: File | null = null;
  upFileName: string | null = null;
  upFileSize: string | null = null;
  upFileType: string | null = null;
  upFileContent: string | null = null; // base64 content
  pdfUrl: SafeResourceUrl | null = null;
  wordPreviewHtml: SafeHtml | null = null;
  excelPreviewHtml: SafeHtml | null = null;
  ferr: string = '';
  
  currentSop: Sop | null = null;
  versionText: string = 'v1';

  constructor(
    private fb: FormBuilder,
    public sopService: SopService,
    private sanitizer: DomSanitizer,
    private fileStorage: FileStorageService,
    private constants: ConstantsService
  ) {}

  ngOnInit() {
    this.categoryOptions = this.categories.map(c => ({ value: c, label: c }));
    
    this.sopForm = this.fb.group({
      name: ['', Validators.required],
      category: ['Cards', Validators.required],
      subCategory: ['', Validators.required],
      version: [{value: 'v1', disabled: true}],
      comments: ['']
    });

    this.onCategoryChange();

    if (this.editId) {
      this.currentSop = this.sopService.getSopById(this.editId) || null;
      if (this.currentSop) {
        this.sopForm.patchValue({
          name: this.currentSop.n,
          category: this.currentSop.c,
          subCategory: this.currentSop.s2,
          comments: this.currentSop.comments || ''
        });
        this.updateSubcategories(this.currentSop.c);
        this.sopForm.patchValue({ subCategory: this.currentSop.s2 });
        
        let nv = this.currentSop.st === 'Draft' ? this.currentSop.v : this.currentSop.v + 1;
        this.versionText = 'v' + nv + (this.currentSop.st !== 'Draft' ? ' (new version)' : '');
        this.upFileName = this.currentSop.fileName || 'document.pdf';
        
        // Load stored file content for preview
        this.loadStoredFile(this.currentSop.id);
      }
    }
  }

  onCategoryChange() {
    const cat = this.sopForm.get('category')?.value;
    this.updateSubcategories(cat);
  }

  updateSubcategories(cat: string) {
    this.subcategories = this.sopService.cats[cat] || [];
    this.subcategoryOptions = this.subcategories.map(s => ({ value: s, label: s }));
    if (this.subcategories.length > 0 && !this.subcategories.includes(this.sopForm.get('subCategory')?.value)) {
      this.sopForm.patchValue({ subCategory: this.subcategories[0] });
    }
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      await this.processFile(file);
    }
  }

  async onFileDropped(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) {
      await this.processFile(file);
    }
  }

  async processFile(file: File) {
    try {
      const result = await this.fileStorage.processFile(file);
      
      this.ferr = '';
      this.upFile = file;
      this.upFileName = result.name;
      this.upFileSize = result.size;
      this.upFileType = result.type;
      this.upFileContent = result.content;
      this.loadPreview();

      if (!this.sopForm.get('name')?.value) {
        const nameWithoutExt = this.fileStorage.sanitizeFilename(file.name);
        this.sopForm.patchValue({ name: nameWithoutExt });
      }
    } catch (error) {
      this.ferr = error as string;
      this.upFile = null;
      this.pdfUrl = null;
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

  // Load stored file content from localStorage
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

  // Save file content to localStorage
  saveStoredFile(sopId: string) {
    if (!this.upFileContent || !this.upFileName) return;
    
    const file: StoredFile = {
      content: this.upFileContent,
      name: this.upFileName,
      type: this.upFileType || '',
      size: this.upFileSize || ''
    };
    this.fileStorage.saveStoredFile(sopId, file);
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

  save(mode: 'Draft' | 'submit') {
    if (this.sopForm.invalid) {
      this.sopForm.markAllAsTouched();
      this.notify.emit('Please fill all mandatory fields');
      return;
    }
    if (!this.editId && !this.upFileName) {
      this.ferr = 'Please upload the SOP file.';
      return;
    }

    const val = this.sopForm.value;
    const now = this.sopService.formatDate();

    if (this.editId && this.currentSop) {
      const wasMod = this.currentSop.st === 'Modification In Progress';
      const action = mode === 'Draft' ? (wasMod ? 'make-changes' : 'save-draft') : (wasMod ? 'resubmit' : 'submit');
      
      if (action === 'save-draft') {
        // Just save as draft
        this.currentSop.n = val.name;
        this.currentSop.c = val.category;
        this.currentSop.s2 = val.subCategory;
        this.currentSop.comments = val.comments;
        this.currentSop.up = now;
        this.currentSop.st = 'Draft';
        if (this.upFileName) {
          this.currentSop.fileName = this.upFileName;
        }
        this.sopService.updateSop(this.currentSop);
        // Save file content to localStorage
        this.saveStoredFile(this.currentSop.id);
        this.notify.emit('Saved as draft');
      } else {
        // Use performAction for proper workflow
        const success = this.sopService.performAction(this.currentSop.id, action as any, val.comments);
        if (success) {
          // Save file content to localStorage for non-draft actions too
          this.saveStoredFile(this.currentSop.id);
          this.notify.emit(mode === 'Draft' ? 'Saved as draft' : `Sent for review as ${this.currentSop?.st}`);
        }
      }
    } else {
      // New SOP
      if (mode === 'Draft') {
        const newSop: Sop = {
          id: this.sopService.generateSopId(),
          n: val.name,
          v: 1,
          c: val.category,
          s2: val.subCategory,
          st: 'Draft',
          by: this.sopService.currentUser.email,
          byn: this.sopService.currentUser.name,
          up: now,
          comments: val.comments,
          fileName: this.upFileName || 'document.pdf',
          createdAt: now,
          hist: [{
            timestamp: this.sopService.formatDateTime(),
            action: 'Created',
            doneBy: this.sopService.currentUser.name,
            doneByEmail: this.sopService.currentUser.email,
            statusBefore: '—',
            statusAfter: 'Draft',
            version: 'v1',
            remarks: ''
          }]
        };
        this.sopService.addSop(newSop);
        // Save file content to localStorage
        this.saveStoredFile(newSop.id);
        this.notify.emit('Saved as draft');
      } else {
        const newSop: Sop = {
          id: this.sopService.generateSopId(),
          n: val.name,
          v: 1,
          c: val.category,
          s2: val.subCategory,
          st: 'Submitted',
          by: this.sopService.currentUser.email,
          byn: this.sopService.currentUser.name,
          up: now,
          comments: val.comments,
          fileName: this.upFileName || 'document.pdf',
          createdAt: now,
          hist: [
            {
              timestamp: this.sopService.formatDateTime(),
              action: 'Created',
              doneBy: this.sopService.currentUser.name,
              doneByEmail: this.sopService.currentUser.email,
              statusBefore: '—',
              statusAfter: 'Draft',
              version: 'v1',
              remarks: ''
            },
            {
              timestamp: this.sopService.formatDateTime(),
              action: 'Submitted',
              doneBy: this.sopService.currentUser.name,
              doneByEmail: this.sopService.currentUser.email,
              statusBefore: 'Draft',
              statusAfter: 'Submitted',
              version: 'v1',
              remarks: ''
            }
          ]
        };
        this.sopService.addSop(newSop);
        // Save file content to localStorage
        this.saveStoredFile(newSop.id);
        this.notify.emit('SOP submitted for review');
      }
    }

    this.back.emit();
  }
}

interface StoredFile {
  content: string;
  name: string;
  type: string;
  size: string;
}
