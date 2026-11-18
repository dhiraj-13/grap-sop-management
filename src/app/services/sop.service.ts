export interface Sop {
  id: string;
  n: string;
  v: number;
  c: string;
  s2: string;
  st: 'Draft' | 'Submitted' | 'Requested Modification' | 'Modification In Progress' | 'Resubmitted' | 'Approved' | 'Rejected';
  by: string;
  byn: string;
  up: string;
  remark?: string;
  rby?: string;
  hist?: ActivityEntry[];
  comments?: string;
  fileName?: string;
  createdAt: string;
}

export interface ActivityEntry {
  timestamp: string;
  action: string;
  doneBy: string;
  doneByEmail: string;
  statusBefore: string;
  statusAfter: string;
  remarks?: string;
  version: string;
  fileVersion?: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  relatedSopId?: string;
}

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SopService {
  public cats: {[key: string]: string[]} = {
    'Cards': ['Credit Card Dispute', 'Chargeback', 'Fees & Charges'],
    'Payments': ['UPI', 'NEFT/RTGS', 'IMPS'],
    'Loans': ['Closure', 'EMI', 'Documents'],
    'ATM': ['Cash Shortage', 'Card Retained'],
    'Legal & Statutory': ['Legal Notice', 'Statutory Notice']
  };

  public currentUser = {
    name: 'Dhiraj Chhabria',
    email: 'dhiraj.chhabria@axisbank.com',
    role: 'Reviewer'
  };

  // Shared search state
  public searchTerm$ = new BehaviorSubject<string>('');

  private sopsSubject = new BehaviorSubject<Sop[]>([]);
  public sops$ = this.sopsSubject.asObservable();

  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private readonly STORAGE_KEY = 'grap_sop_data';
  private readonly NOTIFICATIONS_KEY = 'grap_notifications';
  private readonly USERS_KEY = 'grap_users';

  constructor() {
    this.loadFromStorage();
    this.initializeDefaultUsers();
  }

  private initializeDefaultUsers() {
    const users = this.getUsers();
    if (users.length === 0) {
      const defaultUsers = [
        { name: 'Dhiraj Chhabria', email: 'dhiraj.chhabria@axisbank.com', role: 'Reviewer' },
        { name: 'Dhiraj Devani', email: 'dhiraj.devani@axisbank.com', role: 'Maker' }
      ];
      localStorage.setItem(this.USERS_KEY, JSON.stringify(defaultUsers));
    }
  }

  private getUsers(): any[] {
    try {
      return JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
    } catch {
      return [];
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const sops = JSON.parse(stored);
        this.sopsSubject.next(sops);
      } else {
        this.initializeMockData();
      }

      const storedNotifications = localStorage.getItem(this.NOTIFICATIONS_KEY);
      if (storedNotifications) {
        this.notificationsSubject.next(JSON.parse(storedNotifications));
      } else {
        this.initializeDefaultNotifications();
      }
    } catch (e) {
      console.error('Error loading from localStorage:', e);
      this.initializeMockData();
      this.initializeDefaultNotifications();
    }
  }

  private initializeMockData() {
    const now = new Date().toISOString().split('T')[0].replace(/-/g, ' ').replace(/(\d{4}) (\d{2}) (\d{2})/, '$3 $2 $1');
    const mockSops: Sop[] = [
      {
        id: 'SOP-0012',
        n: 'Credit Card Dispute Handling',
        v: 3,
        c: 'Cards',
        s2: 'Credit Card Dispute',
        st: 'Approved',
        by: 'dhiraj.chhabria@axisbank.com',
        byn: 'Dhiraj Chhabria',
        up: '15 Nov 2026',
        fileName: 'Credit_Card_Dispute_v3.pdf',
        createdAt: '12 Sep 2026',
        hist: [
          { timestamp: '12 Sep 2026 10:12', action: 'Created', doneBy: 'Dhiraj Chhabria', doneByEmail: 'dhiraj.chhabria@axisbank.com', statusBefore: '—', statusAfter: 'Draft', version: 'v1', remarks: '' },
          { timestamp: '12 Sep 2026 16:40', action: 'Submitted', doneBy: 'Dhiraj Chhabria', doneByEmail: 'dhiraj.chhabria@axisbank.com', statusBefore: 'Draft', statusAfter: 'Submitted', version: 'v1', remarks: '' },
          { timestamp: '14 Sep 2026 11:05', action: 'Approved', doneBy: 'Dhiraj Chhabria', doneByEmail: 'dhiraj.chhabria@axisbank.com', statusBefore: 'Submitted', statusAfter: 'Approved', version: 'v1', remarks: 'Looks good.' },
          { timestamp: '10 Nov 2026 09:30', action: 'New version uploaded', doneBy: 'Dhiraj Chhabria', doneByEmail: 'dhiraj.chhabria@axisbank.com', statusBefore: 'Approved', statusAfter: 'Submitted', version: 'v2', remarks: 'Updated TAT to 30 days' },
          { timestamp: '15 Nov 2026 12:00', action: 'Approved', doneBy: 'Dhiraj Chhabria', doneByEmail: 'dhiraj.chhabria@axisbank.com', statusBefore: 'Submitted', statusAfter: 'Approved', version: 'v3', remarks: '' }
        ],
        comments: 'Initial version'
      },
      {
        id: 'SOP-0018',
        n: 'UPI Failed Transaction Refund',
        v: 1,
        c: 'Payments',
        s2: 'UPI',
        st: 'Submitted',
        by: 'dhiraj.chhabria@axisbank.com',
        byn: 'Dhiraj Chhabria',
        up: '14 Nov 2026',
        fileName: 'UPI_Failed_Transaction_Refund_v1.docx',
        createdAt: '14 Nov 2026',
        hist: [
          { timestamp: '14 Nov 2026 10:00', action: 'Created', doneBy: 'Dhiraj Chhabria', doneByEmail: 'dhiraj.chhabria@axisbank.com', statusBefore: '—', statusAfter: 'Draft', version: 'v1', remarks: '' },
          { timestamp: '14 Nov 2026 14:30', action: 'Submitted', doneBy: 'Dhiraj Chhabria', doneByEmail: 'dhiraj.chhabria@axisbank.com', statusBefore: 'Draft', statusAfter: 'Submitted', version: 'v1', remarks: '' }
        ],
        comments: 'UPI refund process SOP'
      },
      {
        id: 'SOP-0021',
        n: 'Loan Closure – Document Return',
        v: 1,
        c: 'Loans',
        s2: 'Documents',
        st: 'Draft',
        by: 'dhiraj.chhabria@axisbank.com',
        byn: 'Dhiraj Chhabria',
        up: '16 Nov 2026',
        fileName: 'Loan_Closure_v1.pdf',
        createdAt: '16 Nov 2026',
        hist: [
          { timestamp: '16 Nov 2026 09:00', action: 'Created', doneBy: 'Dhiraj Chhabria', doneByEmail: 'dhiraj.chhabria@axisbank.com', statusBefore: '—', statusAfter: 'Draft', version: 'v1', remarks: '' }
        ],
        comments: 'Loan closure document return process'
      },
      {
        id: 'SOP-0009',
        n: 'ATM Cash Shortage',
        v: 2,
        c: 'ATM',
        s2: 'Cash Shortage',
        st: 'Requested Modification',
        by: 'dhiraj.chhabria@axisbank.com',
        byn: 'Dhiraj Chhabria',
        up: '16 Nov 2026',
        remark: 'Please add the escalation matrix and the 5-day TAT for branch reconciliation.',
        rby: 'Dhiraj Chhabria',
        fileName: 'ATM_Cash_Shortage_v2.pdf',
        createdAt: '10 Nov 2026',
        hist: [
          { timestamp: '10 Nov 2026 10:00', action: 'Created', doneBy: 'Dhiraj Chhabria', doneByEmail: 'dhiraj.chhabria@axisbank.com', statusBefore: '—', statusAfter: 'Draft', version: 'v1', remarks: '' },
          { timestamp: '10 Nov 2026 15:00', action: 'Submitted', doneBy: 'Dhiraj Chhabria', doneByEmail: 'dhiraj.chhabria@axisbank.com', statusBefore: 'Draft', statusAfter: 'Submitted', version: 'v1', remarks: '' },
          { timestamp: '12 Nov 2026 11:00', action: 'Modification Requested', doneBy: 'Dhiraj Chhabria', doneByEmail: 'dhiraj.chhabria@axisbank.com', statusBefore: 'Submitted', statusAfter: 'Requested Modification', version: 'v1', remarks: 'Please add the escalation matrix and the 5-day TAT for branch reconciliation.' },
          { timestamp: '16 Nov 2026 09:00', action: 'New version uploaded', doneBy: 'Dhiraj Chhabria', doneByEmail: 'dhiraj.chhabria@axisbank.com', statusBefore: 'Requested Modification', statusAfter: 'Modification In Progress', version: 'v2', remarks: 'Added escalation matrix and TAT' }
        ],
        comments: 'ATM cash shortage handling process'
      },
      {
        id: 'SOP-0024',
        n: 'Legal Notice Handling',
        v: 2,
        c: 'Legal & Statutory',
        s2: 'Legal Notice',
        st: 'Resubmitted',
        by: 'dhiraj.chhabria@axisbank.com',
        byn: 'Dhiraj Chhabria',
        up: '16 Nov 2026',
        fileName: 'Legal_Notice_v2.docx',
        createdAt: '12 Nov 2026',
        hist: [
          { timestamp: '12 Nov 2026 10:00', action: 'Created', doneBy: 'Dhiraj Chhabria', doneByEmail: 'dhiraj.chhabria@axisbank.com', statusBefore: '—', statusAfter: 'Draft', version: 'v1', remarks: '' },
          { timestamp: '12 Nov 2026 14:00', action: 'Submitted', doneBy: 'Dhiraj Chhabria', doneByEmail: 'dhiraj.chhabria@axisbank.com', statusBefore: 'Draft', statusAfter: 'Submitted', version: 'v1', remarks: '' },
          { timestamp: '14 Nov 2026 10:00', action: 'Modification Requested', doneBy: 'Dhiraj Chhabria', doneByEmail: 'dhiraj.chhabria@axisbank.com', statusBefore: 'Submitted', statusAfter: 'Requested Modification', version: 'v1', remarks: 'Add regulatory reference section' },
          { timestamp: '16 Nov 2026 09:00', action: 'Resubmitted', doneBy: 'Dhiraj Chhabria', doneByEmail: 'dhiraj.chhabria@axisbank.com', statusBefore: 'Modification In Progress', statusAfter: 'Resubmitted', version: 'v2', remarks: 'Added regulatory references' }
        ],
        comments: 'Legal notice handling process'
      },
      {
        id: 'SOP-0025',
        n: 'Statutory Notice – LEA Requests',
        v: 1,
        c: 'Legal & Statutory',
        s2: 'Statutory Notice',
        st: 'Submitted',
        by: 'dhiraj.chhabria@axisbank.com',
        byn: 'Dhiraj Chhabria',
        up: '15 Nov 2026',
        fileName: 'Statutory_Notice_v1.pdf',
        createdAt: '15 Nov 2026',
        hist: [
          { timestamp: '15 Nov 2026 10:00', action: 'Created', doneBy: 'Dhiraj Chhabria', doneByEmail: 'dhiraj.chhabria@axisbank.com', statusBefore: '—', statusAfter: 'Draft', version: 'v1', remarks: '' },
          { timestamp: '15 Nov 2026 14:00', action: 'Submitted', doneBy: 'Dhiraj Chhabria', doneByEmail: 'dhiraj.chhabria@axisbank.com', statusBefore: 'Draft', statusAfter: 'Submitted', version: 'v1', remarks: '' }
        ],
        comments: 'Statutory notice LEA requests process'
      },
      {
        id: 'SOP-0016',
        n: 'Card Chargeback Process',
        v: 1,
        c: 'Cards',
        s2: 'Chargeback',
        st: 'Submitted',
        by: 'dhiraj.chhabria@axisbank.com',
        byn: 'Dhiraj Chhabria',
        up: '13 Nov 2026',
        fileName: 'Card_Chargeback_v1.pdf',
        createdAt: '13 Nov 2026',
        hist: [
          { timestamp: '13 Nov 2026 10:00', action: 'Created', doneBy: 'Dhiraj Chhabria', doneByEmail: 'dhiraj.chhabria@axisbank.com', statusBefore: '—', statusAfter: 'Draft', version: 'v1', remarks: '' },
          { timestamp: '13 Nov 2026 14:00', action: 'Submitted', doneBy: 'Dhiraj Chhabria', doneByEmail: 'dhiraj.chhabria@axisbank.com', statusBefore: 'Draft', statusAfter: 'Submitted', version: 'v1', remarks: '' }
        ],
        comments: 'Card chargeback handling process'
      },
      {
        id: 'SOP-0011',
        n: 'NEFT Return Handling',
        v: 1,
        c: 'Payments',
        s2: 'NEFT/RTGS',
        st: 'Rejected',
        by: 'dhiraj.chhabria@axisbank.com',
        byn: 'Dhiraj Chhabria',
        up: '05 Nov 2026',
        remark: 'Duplicates SOP-0007; please update that SOP instead.',
        rby: 'Dhiraj Chhabria',
        fileName: 'NEFT_Return_v1.pdf',
        createdAt: '05 Nov 2026',
        hist: [
          { timestamp: '05 Nov 2026 10:00', action: 'Created', doneBy: 'Dhiraj Chhabria', doneByEmail: 'dhiraj.chhabria@axisbank.com', statusBefore: '—', statusAfter: 'Draft', version: 'v1', remarks: '' },
          { timestamp: '05 Nov 2026 14:00', action: 'Submitted', doneBy: 'Dhiraj Chhabria', doneByEmail: 'dhiraj.chhabria@axisbank.com', statusBefore: 'Draft', statusAfter: 'Submitted', version: 'v1', remarks: '' },
          { timestamp: '05 Nov 2026 16:00', action: 'Rejected', doneBy: 'Dhiraj Chhabria', doneByEmail: 'dhiraj.chhabria@axisbank.com', statusBefore: 'Submitted', statusAfter: 'Rejected', version: 'v1', remarks: 'Duplicates SOP-0007; please update that SOP instead.' }
        ],
        comments: 'NEFT return handling process'
      },
      {
        id: 'SOP-0027',
        n: 'EMI Bounce Charges',
        v: 1,
        c: 'Loans',
        s2: 'EMI',
        st: 'Modification In Progress',
        by: 'dhiraj.chhabria@axisbank.com',
        byn: 'Dhiraj Chhabria',
        up: '16 Nov 2026',
        remark: 'Add waiver DOP limits.',
        rby: 'Dhiraj Chhabria',
        fileName: 'EMI_Bounce_v1.docx',
        createdAt: '14 Nov 2026',
        hist: [
          { timestamp: '14 Nov 2026 10:00', action: 'Created', doneBy: 'Dhiraj Chhabria', doneByEmail: 'dhiraj.chhabria@axisbank.com', statusBefore: '—', statusAfter: 'Draft', version: 'v1', remarks: '' },
          { timestamp: '14 Nov 2026 14:00', action: 'Submitted', doneBy: 'Dhiraj Chhabria', doneByEmail: 'dhiraj.chhabria@axisbank.com', statusBefore: 'Draft', statusAfter: 'Submitted', version: 'v1', remarks: '' },
          { timestamp: '15 Nov 2026 10:00', action: 'Modification Requested', doneBy: 'Dhiraj Chhabria', doneByEmail: 'dhiraj.chhabria@axisbank.com', statusBefore: 'Submitted', statusAfter: 'Requested Modification', version: 'v1', remarks: 'Add waiver DOP limits.' },
          { timestamp: '16 Nov 2026 09:00', action: 'Modification In Progress', doneBy: 'Dhiraj Chhabria', doneByEmail: 'dhiraj.chhabria@axisbank.com', statusBefore: 'Requested Modification', statusAfter: 'Modification In Progress', version: 'v1', remarks: 'Working on waiver DOP limits' }
        ],
        comments: 'EMI bounce charges process'
      },
      {
        id: 'SOP-0028',
        n: 'KYC Verification Process',
        v: 1,
        c: 'Legal & Statutory',
        s2: 'Legal Notice',
        st: 'Draft',
        by: 'dhiraj.devani@axisbank.com',
        byn: 'Dhiraj Devani',
        up: '17 Nov 2026',
        fileName: 'KYC_Verification_v1.pdf',
        createdAt: '17 Nov 2026',
        hist: [
          { timestamp: '17 Nov 2026 10:00', action: 'Created', doneBy: 'Dhiraj Devani', doneByEmail: 'dhiraj.devani@axisbank.com', statusBefore: '—', statusAfter: 'Draft', version: 'v1', remarks: '' }
        ],
        comments: 'KYC verification for new customers'
      },
      {
        id: 'SOP-0029',
        n: 'Account Opening Procedure',
        v: 1,
        c: 'Payments',
        s2: 'UPI',
        st: 'Submitted',
        by: 'dhiraj.devani@axisbank.com',
        byn: 'Dhiraj Devani',
        up: '16 Nov 2026',
        fileName: 'Account_Opening_v1.docx',
        createdAt: '15 Nov 2026',
        hist: [
          { timestamp: '15 Nov 2026 10:00', action: 'Created', doneBy: 'Dhiraj Devani', doneByEmail: 'dhiraj.devani@axisbank.com', statusBefore: '—', statusAfter: 'Draft', version: 'v1', remarks: '' },
          { timestamp: '16 Nov 2026 14:00', action: 'Submitted', doneBy: 'Dhiraj Devani', doneByEmail: 'dhiraj.devani@axisbank.com', statusBefore: 'Draft', statusAfter: 'Submitted', version: 'v1', remarks: '' }
        ],
        comments: 'New account opening process'
      },
      {
        id: 'SOP-0030',
        n: 'Fraud Detection & Reporting',
        v: 2,
        c: 'Cards',
        s2: 'Credit Card Dispute',
        st: 'Approved',
        by: 'dhiraj.devani@axisbank.com',
        byn: 'Dhiraj Devani',
        up: '14 Nov 2026',
        fileName: 'Fraud_Detection_v2.pdf',
        createdAt: '10 Nov 2026',
        hist: [
          { timestamp: '10 Nov 2026 10:00', action: 'Created', doneBy: 'Dhiraj Devani', doneByEmail: 'dhiraj.devani@axisbank.com', statusBefore: '—', statusAfter: 'Draft', version: 'v1', remarks: '' },
          { timestamp: '11 Nov 2026 14:00', action: 'Submitted', doneBy: 'Dhiraj Devani', doneByEmail: 'dhiraj.devani@axisbank.com', statusBefore: 'Draft', statusAfter: 'Submitted', version: 'v1', remarks: '' },
          { timestamp: '14 Nov 2026 11:00', action: 'Approved', doneBy: 'Dhiraj Chhabria', doneByEmail: 'dhiraj.chhabria@axisbank.com', statusBefore: 'Submitted', statusAfter: 'Approved', version: 'v2', remarks: 'Well documented' }
        ],
        comments: 'Fraud detection and reporting process'
      }
    ];
    this.sopsSubject.next(mockSops);
    this.saveToStorage();
  }

  private initializeDefaultNotifications() {
    const notifications: Notification[] = [
      {
        id: 'notif-1',
        type: 'info',
        title: 'SOP Resubmitted',
        message: 'Legal Notice Handling v2 resubmitted by Dhiraj Chhabria',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        read: false,
        relatedSopId: 'SOP-0024'
      },
      {
        id: 'notif-2',
        type: 'warning',
        title: 'Modification Requested',
        message: 'ATM Cash Shortage: modification requested by Dhiraj Chhabria',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
        relatedSopId: 'SOP-0009'
      },
      {
        id: 'notif-3',
        type: 'success',
        title: 'SOP Approved',
        message: 'Credit Card Dispute v3 approved & published',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        read: true,
        relatedSopId: 'SOP-0012'
      }
    ];
    this.notificationsSubject.next(notifications);
    this.saveNotifications();
  }

  private saveToStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.sopsSubject.value));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }

  private saveNotifications() {
    try {
      localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(this.notificationsSubject.value));
    } catch (e) {
      console.error('Error saving notifications:', e);
    }
  }

  getSops(): Sop[] {
    return this.sopsSubject.value;
  }

  getNotifications(): Notification[] {
    return this.notificationsSubject.value;
  }

  getUnreadNotificationCount(): number {
    return this.notificationsSubject.value.filter(n => !n.read).length;
  }

  markNotificationAsRead(id: string) {
    const notifications = this.notificationsSubject.value.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    this.notificationsSubject.next(notifications);
    this.saveNotifications();
  }

  markAllNotificationsAsRead() {
    const notifications = this.notificationsSubject.value.map(n => ({ ...n, read: true }));
    this.notificationsSubject.next(notifications);
    this.saveNotifications();
  }

  addNotification(notification: Omit<Notification, 'id' | 'timestamp'>) {
    const newNotification: Notification = {
      ...notification,
      id: 'notif-' + Date.now(),
      timestamp: new Date().toISOString()
    };
    const notifications = [newNotification, ...this.notificationsSubject.value].slice(0, 50);
    this.notificationsSubject.next(notifications);
    this.saveNotifications();
  }

  setSearchTerm(term: string) {
    this.searchTerm$.next(term);
  }

  setCurrentUser(role: 'Maker' | 'Reviewer') {
    const users = this.getUsers();
    const user = users.find(u => u.role === role) || users[0];
    this.currentUser = {
      name: user.name,
      email: user.email,
      role: user.role
    };
  }

  addSop(sop: Sop) {
    const sops = this.sopsSubject.value;
    sops.unshift(sop);
    this.sopsSubject.next(sops);
    this.saveToStorage();
    
    // Notify reviewers
    this.addNotification({
      type: 'info',
      title: 'New SOP Submitted',
      message: `${sop.n} submitted by ${sop.byn}`,
      read: false,
      relatedSopId: sop.id
    });
  }

  updateSop(sop: Sop) {
    const sops = this.sopsSubject.value;
    const idx = sops.findIndex(s => s.id === sop.id);
    if (idx !== -1) {
      sops[idx] = sop;
      this.sopsSubject.next(sops);
      this.saveToStorage();
    }
  }

  addActivityEntry(sopId: string, entry: Omit<ActivityEntry, 'timestamp'>) {
    const sops = this.sopsSubject.value;
    const sop = sops.find(s => s.id === sopId);
    if (sop) {
      const newEntry: ActivityEntry = {
        ...entry,
        timestamp: new Date().toISOString()
      };
      if (!sop.hist) sop.hist = [];
      sop.hist.unshift(newEntry); // newest first
      this.saveToStorage();
    }
  }

  getSopById(id: string): Sop | undefined {
    return this.sopsSubject.value.find(s => s.id === id);
  }

  generateSopId(): string {
    const sops = this.sopsSubject.value;
    const maxNum = sops.reduce((max, sop) => {
      const num = parseInt(sop.id.replace('SOP-', ''), 10);
      return num > max ? num : max;
    }, 0);
    return `SOP-${String(maxNum + 1).padStart(4, '0')}`;
  }

  formatDate(date: Date = new Date()): string {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, ' ');
  }

  formatDateTime(date: Date = new Date()): string {
    return date.toLocaleString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', '');
  }

  canEdit(sop: Sop): boolean {
    return sop.st === 'Draft' || sop.st === 'Modification In Progress';
  }

  canMakeChanges(sop: Sop): boolean {
    return sop.st === 'Requested Modification';
  }

  canReview(sop: Sop): boolean {
    return sop.st === 'Submitted' || sop.st === 'Resubmitted';
  }

  canViewActivity(sop: Sop): boolean {
    return true;
  }

  getNextStatus(currentStatus: string, action: 'submit' | 'approve' | 'reject' | 'request-modification' | 'resubmit'): string {
    switch (action) {
      case 'submit':
        return currentStatus === 'Draft' ? 'Submitted' : 'Resubmitted';
      case 'approve':
        return 'Approved';
      case 'reject':
        return 'Rejected';
      case 'request-modification':
        return 'Requested Modification';
      case 'resubmit':
        return 'Resubmitted';
      default:
        return currentStatus;
    }
  }

  performAction(sopId: string, action: 'submit' | 'approve' | 'reject' | 'request-modification' | 'resubmit' | 'make-changes', remarks?: string) {
    const sop = this.getSopById(sopId);
    if (!sop) return false;

    const currentUser = this.currentUser;
    const statusBefore = sop.st;
    let statusAfter = statusBefore;
    let actionName = '';

    switch (action) {
      case 'submit':
        statusAfter = sop.st === 'Draft' ? 'Submitted' : 'Resubmitted';
        actionName = sop.st === 'Draft' ? 'Submitted' : 'Resubmitted';
        break;
      case 'approve':
        statusAfter = 'Approved';
        actionName = 'Approved';
        break;
      case 'reject':
        statusAfter = 'Rejected';
        actionName = 'Rejected';
        break;
      case 'request-modification':
        statusAfter = 'Requested Modification';
        actionName = 'Modification Requested';
        break;
      case 'resubmit':
        statusAfter = 'Resubmitted';
        actionName = 'Resubmitted';
        break;
      case 'make-changes':
        statusAfter = 'Modification In Progress';
        actionName = 'Modification In Progress';
        break;
    }

    sop.st = statusAfter;
    sop.up = this.formatDate();
    if (remarks) {
      sop.remark = remarks;
      sop.rby = currentUser.name;
    }
    if (action === 'submit' || action === 'resubmit') {
      delete sop.remark;
      delete sop.rby;
    }
    if (action === 'make-changes') {
      // Keep the remark for reference
    }

    // Add activity entry
    this.addActivityEntry(sopId, {
      action: actionName,
      doneBy: currentUser.name,
      doneByEmail: currentUser.email,
      statusBefore,
      statusAfter,
      remarks,
      version: `v${sop.v}`,
      fileVersion: action === 'submit' && statusBefore !== 'Draft' ? `v${sop.v - 1} → v${sop.v}` : undefined
    });

    // Handle version increment
    if ((action === 'submit' || action === 'resubmit') && statusBefore !== 'Draft' && statusBefore !== 'Modification In Progress') {
      sop.v++;
    } else if (action === 'make-changes' || (action === 'submit' && statusBefore === 'Modification In Progress')) {
      sop.v++;
    }

    // Create notifications for relevant users
    if (action === 'submit' || action === 'resubmit') {
      this.addNotification({
        type: 'info',
        title: 'SOP Submitted for Review',
        message: `${sop.n} ${action === 'submit' ? 'submitted' : 'resubmitted'} by ${currentUser.name}`,
        read: false,
        relatedSopId: sopId
      });
    } else if (action === 'approve') {
      this.addNotification({
        type: 'success',
        title: 'SOP Approved',
        message: `${sop.n} approved by ${currentUser.name}`,
        read: false,
        relatedSopId: sopId
      });
    } else if (action === 'reject') {
      this.addNotification({
        type: 'error',
        title: 'SOP Rejected',
        message: `${sop.n} rejected by ${currentUser.name}`,
        read: false,
        relatedSopId: sopId
      });
    } else if (action === 'request-modification') {
      this.addNotification({
        type: 'warning',
        title: 'Modification Requested',
        message: `${sop.n} modification requested by ${currentUser.name}`,
        read: false,
        relatedSopId: sopId
      });
    }

    this.saveToStorage();
    return true;
  }
}
