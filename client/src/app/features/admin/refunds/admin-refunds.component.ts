import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RefundService } from '../../../core/services/refund.service';
import { Refund } from '../../../core/interfaces';

@Component({
  selector: 'app-admin-refunds',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-container">
      <div class="admin-header">
        <div>
          <h2>Refund Requests</h2>
          <p>Review customer cancellation refund requests and auto-credit digital wallet balance</p>
        </div>
      </div>

      <div class="glass-card table-card">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Booking PNR</th>
              <th>Refund Amount</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of refunds">
              <td>{{ r.user.name }}<br><small>{{ r.user.email }}</small></td>
              <td><strong>{{ r.booking.pnr }}</strong></td>
              <td><strong>₹{{ r.amount }}</strong></td>
              <td>{{ r.reason }}</td>
              <td>
                <span class="badge" [ngClass]="{
                  'badge-warning': r.status === 'Requested',
                  'badge-success': r.status === 'Approved' || r.status === 'Processed',
                  'badge-danger': r.status === 'Rejected'
                }">{{ r.status }}</span>
              </td>
              <td>
                <button *ngIf="r.status === 'Requested'" (click)="approveRefund(r)" class="btn-success-sm">Approve & Credit Wallet</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .admin-container { padding: 40px 0; }
    .admin-header { margin-bottom: 30px; h2 { font-size: 2rem; font-weight: 800; } }

    .table-card { padding: 24px; }
    .admin-table {
      width: 100%; border-collapse: collapse; font-size: 0.9rem;
      th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid var(--border-color); }
      th { font-weight: 700; color: var(--text-muted); background: var(--bg-primary); }
    }

    .btn-success-sm { background: #16a34a; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 700; cursor: pointer; }
  `]
})
export class AdminRefundsComponent implements OnInit {
  refundService = inject(RefundService);
  refunds: Refund[] = [];

  ngOnInit() {
    this.fetchRefunds();
  }

  fetchRefunds() {
    this.refundService.getRefunds().subscribe({ next: data => this.refunds = data });
  }

  approveRefund(refund: Refund) {
    this.refundService.updateRefundStatus(refund._id, 'Approved', 'Refund credited to user wallet').subscribe({
      next: () => {
        alert(`Refund of ₹${refund.amount} approved and credited to customer's digital wallet!`);
        this.fetchRefunds();
      }
    });
  }
}
