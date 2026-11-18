import { Injectable } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ConstantsService } from './constants.service';

export interface StoredFile {
  content: string;
  name: string;
  type: string;
  size: string;
}

@Injectable({
  providedIn: 'root'
})
export class FileStorageService {
  private readonly STORAGE_KEY = this.constants.storageKeys.SOP_FILES;

  constructor(
    private constants: ConstantsService,
    private sanitizer: DomSanitizer
  ) {}

  /**
   * Load stored file from localStorage
   */
  loadStoredFile(sopId: string): StoredFile | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const files = JSON.parse(stored);
        return files[sopId] || null;
      }
    } catch (e) {
      console.error('Error loading stored file:', e);
    }
    return null;
  }

  /**
   * Save file content to localStorage
   */
  saveStoredFile(sopId: string, file: StoredFile): boolean {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const files = stored ? JSON.parse(stored) : {};
      files[sopId] = file;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(files));
      return true;
    } catch (e) {
      console.error('Error saving file to localStorage:', e);
      return false;
    }
  }

  /**
   * Create SafeResourceUrl for PDF preview
   */
  createPdfUrl(content: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(content);
  }

  /**
   * Process file and return base64 content
   */
  async processFile(file: File): Promise<StoredFile> {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const allowed = this.constants.fileUpload.allowedTypes;
    
    if (!allowed.includes(ext)) {
      throw new Error(`"${file.name}" is not allowed. Please upload a Word (.doc, .docx) or PDF file.`);
    }

    if (file.size > this.constants.fileUpload.maxSizeBytes) {
      throw new Error('File size too large. Maximum limit is 10MB.');
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        resolve({
          content: e.target.result,
          name: file.name,
          type: ext,
          size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
        });
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Sanitize filename for display
   */
  sanitizeFilename(filename: string): string {
    return filename.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
  }

  /**
   * Check if file type is PDF
   */
  isPdf(type: string | null): boolean {
    return type === 'pdf';
  }
}