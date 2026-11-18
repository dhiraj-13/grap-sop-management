import { Component, EventEmitter, Input, OnInit, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SopService, Sop } from '../../services/sop.service';
import { Subscription } from 'rxjs';
import { CustomDropdownComponent, DropdownOption } from '../custom-dropdown/custom-dropdown.component';
import { ConstantsService } from '../../shared/constants.service';

@Component({
  selector: 'app-listing',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomDropdownComponent],
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.scss']
})
export class ListingComponent implements OnInit, OnDestroy {
  @Output() navigate = new EventEmitter<{page: string, id?: string, canAct?: boolean}>();
  
  tab: 'mine' | 'review' = 'mine';
  selectedCategory: string = '';
  selectedStatus: string = '';
  searchTerm: string = '';
  dateFrom: string = '';
  dateTo: string = '';
  
  categories = Object.keys(this.sopService.cats);
  statuses = this.constants.sopStatuses;
  
  categoryOptions: DropdownOption[] = [];
  statusOptions: DropdownOption[] = [];
  
  // Pagination
  currentPage = 1;
  pageSize = this.constants.pagination.defaultPageSize;
  totalPages = 1;

  private searchSub!: Subscription;
  private sopsSub!: Subscription;
  private sops: Sop[] = [];

  // Time-based greeting
  greeting = '';

  constructor(public sopService: SopService, private constants: ConstantsService) {}

  ngOnInit() {
    this.categoryOptions = this.categories.map(c => ({ value: c, label: c }));
    this.statusOptions = this.statuses.map(s => ({ value: s, label: s }));
    
    // Set initial greeting
    this.updateGreeting();
    // Update greeting every minute
    setInterval(() => this.updateGreeting(), 60000);
    
    // Subscribe to search term
    this.searchSub = this.sopService.searchTerm$.subscribe(term => {
      this.searchTerm = term;
      this.currentPage = 1;
    });
    
    // Subscribe to sops observable for real-time updates
    this.sopsSub = this.sopService.sops$.subscribe(sops => {
      this.sops = sops;
      this.currentPage = 1;
    });
  }

  ngOnDestroy() {
    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }
    if (this.sopsSub) {
      this.sopsSub.unsubscribe();
    }
  }

  updateGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greeting = 'Good Morning';
    } else if (hour < 17) {
      this.greeting = 'Good Afternoon';
    } else {
      this.greeting = 'Good Evening';
    }
  }

  get mineList(): Sop[] {
    return this.sops.filter(s => s.by === this.sopService.currentUser.email);
  }

  get reviewList(): Sop[] {
    return this.sops.filter(s => s.by !== this.sopService.currentUser.email && (s.st === 'Submitted' || s.st === 'Resubmitted'));
  }

  get filteredRows(): Sop[] {
    let rows = this.tab === 'review' ? this.reviewList : this.mineList;
    return rows.filter(s => {
      const matchCat = !this.selectedCategory || s.c === this.selectedCategory;
      const matchSt = !this.selectedStatus || s.st === this.selectedStatus;
      const matchSearch = !this.searchTerm || s.n.toLowerCase().includes(this.searchTerm.toLowerCase()) || s.id.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchDateFrom = !this.dateFrom || new Date(s.createdAt) >= new Date(this.dateFrom);
      const matchDateTo = !this.dateTo || new Date(s.createdAt) <= new Date(this.dateTo);
      return matchCat && matchSt && matchSearch && matchDateFrom && matchDateTo;
    });
  }

  get paginatedRows(): Sop[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.totalPages = Math.ceil(this.filteredRows.length / this.pageSize);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }
    return this.filteredRows.slice(start, end);
  }

  get kpis() {
    const m = this.mineList;
    const r = this.reviewList;
    if (this.sopService.currentUser.role === 'Reviewer') {
      return [
        { label: 'Waiting for my review', val: r.length, action: 'review', status: '' },
        { label: 'My drafts', val: m.filter(s => s.st === 'Draft').length, action: 'mine', status: 'Draft' },
        { label: 'Needs my changes', val: m.filter(s => s.st.includes('Modification')).length, action: 'mine', status: '' },
        { label: 'Approved (live)', val: this.sops.filter(s => s.st === 'Approved').length, action: 'mine', status: 'Approved' }
      ];
    } else {
      return [
        { label: 'My drafts', val: m.filter(s => s.st === 'Draft').length, action: 'mine', status: 'Draft' },
        { label: 'In review', val: m.filter(s => ['Submitted', 'Resubmitted'].includes(s.st)).length, action: 'mine', status: 'Submitted' },
        { label: 'Needs my changes', val: m.filter(s => s.st.includes('Modification')).length, action: 'mine', status: '' },
        { label: 'Approved (live)', val: m.filter(s => s.st === 'Approved').length, action: 'mine', status: 'Approved' }
      ];
    }
  }

  kpiClick(kpi: any) {
    if (kpi.action === 'review') {
      this.tab = 'review';
      this.selectedStatus = '';
    } else {
      this.tab = 'mine';
      this.selectedStatus = kpi.status;
    }
    this.currentPage = 1;
  }

  badgeClass(st: string): string {
    return 'pill st-' + st.split(' ')[0];
  }

  getKpiId(label: string): string {
    return 'kpi-' + label.toLowerCase().replace(/[^a-z0-9]/g, '-');
  }

  openAdd() {
    this.navigate.emit({ page: 'form' });
  }

  openView(id: string) {
    this.navigate.emit({ page: 'review', id, canAct: false });
  }

  openReview(id: string) {
    this.navigate.emit({ page: 'review', id, canAct: true });
  }

  openEdit(id: string) {
    this.navigate.emit({ page: 'form', id });
  }

  makeChanges(id: string) {
    this.sopService.performAction(id, 'make-changes');
    this.navigate.emit({ page: 'form', id });
  }

  openActivity(id: string) {
    this.navigate.emit({ page: 'activity', id });
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = this.constants.pagination.maxVisiblePages;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  onPageSizeChange() {
    this.currentPage = 1;
  }

  clearFilters() {
    this.selectedCategory = '';
    this.selectedStatus = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.currentPage = 1;
  }

  hasActiveFilters(): boolean {
    return !!(this.selectedCategory || this.selectedStatus || this.dateFrom || this.dateTo);
  }
}
