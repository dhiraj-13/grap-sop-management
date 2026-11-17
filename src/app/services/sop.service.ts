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
  hist?: any[];
  comments?: string;
  fileName?: string;
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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
    name: 'Priya Singh',
    email: 'priya.singh@axisbank.com',
    role: 'Reviewer'
  };

  private sopsData: Sop[] = [
    {
      id: 'SOP-0012',
      n: 'Credit Card Dispute Handling',
      v: 3,
      c: 'Cards',
      s2: 'Credit Card Dispute',
      st: 'Approved',
      by: 'priya.singh@axisbank.com',
      byn: 'Priya Singh',
      up: '15 Nov 2026',
      fileName: 'Credit_Card_Dispute_v3.pdf',
      hist: [
        ['12 Sep 2026 10:12', 'Created', '—', 'Draft', 'v1', 'Priya Singh', ''],
        ['12 Sep 2026 16:40', 'Submitted', 'Draft', 'Submitted', 'v1', 'Priya Singh', ''],
        ['14 Sep 2026 11:05', 'Approved', 'Submitted', 'Approved', 'v1', 'Rahul Mehta', 'Looks good.'],
        ['10 Nov 2026 09:30', 'New version uploaded', 'Approved', 'Submitted', 'v2', 'Priya Singh', 'Updated TAT to 30 days'],
        ['15 Nov 2026 12:00', 'Approved', 'Submitted', 'Approved', 'v3', 'Rahul Mehta', '']
      ]
    },
    {
      id: 'SOP-0018',
      n: 'UPI Failed Transaction Refund',
      v: 1,
      c: 'Payments',
      s2: 'UPI',
      st: 'Submitted',
      by: 'priya.singh@axisbank.com',
      byn: 'Priya Singh',
      up: '14 Nov 2026',
      fileName: 'UPI_Failed_Transaction_Refund_v1.docx'
    },
    {
      id: 'SOP-0021',
      n: 'Loan Closure – Document Return',
      v: 1,
      c: 'Loans',
      s2: 'Documents',
      st: 'Draft',
      by: 'priya.singh@axisbank.com',
      byn: 'Priya Singh',
      up: '16 Nov 2026',
      fileName: 'Loan_Closure_v1.pdf'
    },
    {
      id: 'SOP-0009',
      n: 'ATM Cash Shortage',
      v: 2,
      c: 'ATM',
      s2: 'Cash Shortage',
      st: 'Requested Modification',
      by: 'priya.singh@axisbank.com',
      byn: 'Priya Singh',
      up: '16 Nov 2026',
      remark: 'Please add the escalation matrix and the 5-day TAT for branch reconciliation.',
      rby: 'Anu Jha',
      fileName: 'ATM_Cash_Shortage_v2.pdf'
    },
    {
      id: 'SOP-0024',
      n: 'Legal Notice Handling',
      v: 2,
      c: 'Legal & Statutory',
      s2: 'Legal Notice',
      st: 'Resubmitted',
      by: 'anu.jha@axisbank.com',
      byn: 'Anu Jha',
      up: '16 Nov 2026',
      fileName: 'Legal_Notice_v2.docx'
    },
    {
      id: 'SOP-0025',
      n: 'Statutory Notice – LEA Requests',
      v: 1,
      c: 'Legal & Statutory',
      s2: 'Statutory Notice',
      st: 'Submitted',
      by: 'mohith.kumar@axisbank.com',
      byn: 'Mohith Kumar',
      up: '15 Nov 2026',
      fileName: 'Statutory_Notice_v1.pdf'
    },
    {
      id: 'SOP-0016',
      n: 'Card Chargeback Process',
      v: 1,
      c: 'Cards',
      s2: 'Chargeback',
      st: 'Submitted',
      by: 'sneha.iyer@axisbank.com',
      byn: 'Sneha Iyer',
      up: '13 Nov 2026',
      fileName: 'Card_Chargeback_v1.pdf'
    },
    {
      id: 'SOP-0011',
      n: 'NEFT Return Handling',
      v: 1,
      c: 'Payments',
      s2: 'NEFT/RTGS',
      st: 'Rejected',
      by: 'priya.singh@axisbank.com',
      byn: 'Priya Singh',
      up: '05 Nov 2026',
      remark: 'Duplicates SOP-0007; please update that SOP instead.',
      rby: 'Rahul Mehta',
      fileName: 'NEFT_Return_v1.pdf'
    },
    {
      id: 'SOP-0027',
      n: 'EMI Bounce Charges',
      v: 1,
      c: 'Loans',
      s2: 'EMI',
      st: 'Modification In Progress',
      by: 'priya.singh@axisbank.com',
      byn: 'Priya Singh',
      up: '16 Nov 2026',
      remark: 'Add waiver DOP limits.',
      rby: 'Anu Jha',
      fileName: 'EMI_Bounce_v1.docx'
    }
  ];

  private sopsSubject = new BehaviorSubject<Sop[]>(this.sopsData);
  public sops$ = this.sopsSubject.asObservable();

  constructor() { }

  getSops(): Sop[] {
    return this.sopsData;
  }

  updateSops(updated: Sop[]) {
    this.sopsData = updated;
    this.sopsSubject.next(this.sopsData);
  }

  addSop(sop: Sop) {
    this.sopsData.unshift(sop);
    this.sopsSubject.next(this.sopsData);
  }

  updateSop(sop: Sop) {
    const idx = this.sopsData.findIndex(s => s.id === sop.id);
    if (idx !== -1) {
      this.sopsData[idx] = sop;
      this.sopsSubject.next(this.sopsData);
    }
  }
}
