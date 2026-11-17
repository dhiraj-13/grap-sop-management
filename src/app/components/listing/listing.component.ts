import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SopService, Sop } from '../../services/sop.service';

@Component({
  selector: 'app-listing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.scss']
})
export class ListingComponent {
  @Output() navigate = new EventEmitter<{page: string, id?: string, canAct?: boolean}>();
  
  tab: 'mine' | 'review' = 'mine';
  searchTerm: string = '';
  selectedCategory: string = '';
  selectedStatus: string = '';
  
  categories = Object.keys(this.sopService.cats);
  statuses = ['Draft', 'Submitted', 'Requested Modification', 'Modification In Progress', 'Resubmitted', 'Approved', 'Rejected'];

  constructor(public sopService: SopService) {}

  get mineList(): Sop[] {
    return this.sopService.getSops().filter(s => s.by === this.sopService.currentUser.email);
  }

  get reviewList(): Sop[] {
    return this.sopService.getSops().filter(s => s.by !== this.sopService.currentUser.email && (s.st === 'Submitted' || s.st === 'Resubmitted'));
  }

  get filteredRows(): Sop[] {
    let rows = this.tab === 'review' ? this.reviewList : this.mineList;
    return rows.filter(s => {
      const matchCat = !this.selectedCategory || s.c === this.selectedCategory;
      const matchSt = !this.selectedStatus || s.st === this.selectedStatus;
      const matchSearch = !this.searchTerm || (s.n + s.id).toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchCat && matchSt && matchSearch;
    });
  }

  get kpis() {
    const m = this.mineList;
    const r = this.reviewList;
    if (this.sopService.currentUser.role === 'Reviewer') {
      return [
        { label: 'Waiting for my review', val: r.length, action: 'review', status: '' },
        { label: 'My drafts', val: m.filter(s => s.st === 'Draft').length, action: 'mine', status: 'Draft' },
        { label: 'Needs my changes', val: m.filter(s => s.st.includes('Modification')).length, action: 'mine', status: '' },
        { label: 'Approved (live)', val: this.sopService.getSops().filter(s => s.st === 'Approved').length, action: 'mine', status: 'Approved' }
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
    const s = this.sopService.getSops().find(x => x.id === id);
    if (s) {
      s.st = 'Modification In Progress';
      this.sopService.updateSop(s);
      this.navigate.emit({ page: 'form', id });
    }
  }

  openActivity(id: string) {
    this.navigate.emit({ page: 'activity', id });
  }
}
