import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SopService, Sop } from '../../services/sop.service';
import { CustomDropdownComponent, DropdownOption } from '../custom-dropdown/custom-dropdown.component';

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
  pdfUrl: SafeResourceUrl | null = null;
  ferr: string = '';
  
  currentSop: Sop | null = null;
  versionText: string = 'v1';

  constructor(
    private fb: FormBuilder, 
    public sopService: SopService,
    private sanitizer: DomSanitizer
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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.processFile(file);
    }
  }

  onFileDropped(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.processFile(file);
    }
  }

  processFile(file: File) {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const allowed = ['pdf', 'doc', 'docx'];
    
    if (!allowed.includes(ext)) {
      this.ferr = `"${file.name}" is not allowed. Please upload a Word (.doc, .docx) or PDF file.`;
      this.upFile = null;
      this.pdfUrl = null;
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      this.ferr = 'File size too large. Maximum limit is 10MB.';
      this.upFile = null;
      this.pdfUrl = null;
      return;
    }

    this.ferr = '';
    this.upFile = file;
    this.upFileName = file.name;
    this.upFileSize = (file.size / 1024 / 1024).toFixed(2) + ' MB';
    this.upFileType = ext;

    if (ext === 'pdf') {
      const blobUrl = URL.createObjectURL(file);
      this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
    } else {
      this.pdfUrl = null;
    }

    if (!this.sopForm.get('name')?.value) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, ' ');
      this.sopForm.patchValue({ name: nameWithoutExt });
    }
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
        this.notify.emit('Saved as draft');
      } else {
        // Use performAction for proper workflow
        const success = this.sopService.performAction(this.currentSop.id, action as any, val.comments);
        if (success) {
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
        this.notify.emit('SOP submitted for review');
      }
    }

    this.back.emit();
  }
}
