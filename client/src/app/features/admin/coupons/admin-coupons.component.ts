import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CouponService } from '../../../core/services/coupon.service';
import { Coupon } from '../../../core/interfaces';

@Component({
  selector: 'app-admin-coupons',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-container">
      <div class="admin-header">
        <div>
          <h2>Manage Promo Coupons</h2>
          <p>Create percentage and flat discount promo codes for checkout</p>
        </div>
        <button (click)="showModal = true" class="btn-primary">+ Create Coupon</button>
      </div>

      <div class="glass-card table-card">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Type</th>
              <th>Discount Value</th>
              <th>Min Booking</th>
              <th>Expiry Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of coupons">
              <td><strong>{{ c.code }}</strong></td>
              <td>{{ c.discountType | uppercase }}</td>
              <td>{{ c.discountType === 'percentage' ? c.discountValue + '%' : '₹' + c.discountValue }}</td>
              <td>₹{{ c.minBookingAmount }}</td>
              <td>{{ c.expiryDate | date:'mediumDate' }}</td>
              <td><span class="badge badge-success">ACTIVE</span></td>
              <td>
                <button (click)="deleteCoupon(c._id)" class="btn-danger-sm">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add Coupon Modal -->
      <div class="modal-backdrop" *ngIf="showModal">
        <div class="modal-card glass-card">
          <h3>Create Discount Coupon</h3>
          <form (ngSubmit)="saveCoupon()" class="modal-form">
            <div class="form-group">
              <label>Coupon Code</label>
              <input type="text" [(ngModel)]="code" name="c" required placeholder="FESTIVE2026" class="custom-input uppercase">
            </div>

            <div class="form-group">
              <label>Discount Type</label>
              <select [(ngModel)]="discountType" name="dt" class="custom-select">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Flat Fixed Amount (₹)</option>
              </select>
            </div>

            <div class="form-group">
              <label>Discount Value</label>
              <input type="number" [(ngModel)]="discountValue" name="dv" required class="custom-input">
            </div>

            <div class="form-group">
              <label>Min Booking Amount (₹)</label>
              <input type="number" [(ngModel)]="minBookingAmount" name="mb" required class="custom-input">
            </div>

            <div class="form-group">
              <label>Expiry Date</label>
              <input type="date" [(ngModel)]="expiryDate" name="ed" required class="custom-input">
            </div>

            <div class="modal-actions">
              <button (click)="showModal = false" type="button" class="btn-secondary">Cancel</button>
              <button type="submit" class="btn-primary">Create Coupon</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-container { padding: 40px 0; }
    .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; h2 { font-size: 2rem; font-weight: 800; } }

    .table-card { padding: 24px; }
    .admin-table {
      width: 100%; border-collapse: collapse; font-size: 0.9rem;
      th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid var(--border-color); }
      th { font-weight: 700; color: var(--text-muted); background: var(--bg-primary); }
    }

    .btn-danger-sm { background: #ef4444; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 700; cursor: pointer; }

    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 2000; display: flex; justify-content: center; align-items: center; }
    .modal-card { width: 100%; max-width: 450px; padding: 32px; }
    .modal-form { display: flex; flex-direction: column; gap: 14px; margin-top: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 4px; label { font-size: 0.78rem; font-weight: 700; color: var(--text-muted); } }

    .custom-input, .custom-select { height: 42px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-primary); padding: 0 10px; font-weight: 600; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 10px; }
  `]
})
export class AdminCouponsComponent implements OnInit {
  couponService = inject(CouponService);

  coupons: Coupon[] = [];
  showModal: boolean = false;

  code: string = '';
  discountType: 'percentage' | 'fixed' = 'percentage';
  discountValue: number = 15;
  minBookingAmount: number = 3000;
  expiryDate: string = new Date('2027-12-31').toISOString().split('T')[0];

  ngOnInit() {
    this.fetchCoupons();
  }

  fetchCoupons() {
    this.couponService.getCoupons().subscribe({ next: data => this.coupons = data });
  }

  saveCoupon() {
    const payload = {
      code: this.code,
      discountType: this.discountType,
      discountValue: this.discountValue,
      minBookingAmount: this.minBookingAmount,
      expiryDate: this.expiryDate
    };

    this.couponService.addCoupon(payload).subscribe({
      next: () => {
        this.showModal = false;
        this.fetchCoupons();
      }
    });
  }

  deleteCoupon(id: string) {
    if (confirm('Delete this coupon?')) {
      this.couponService.deleteCoupon(id).subscribe({ next: () => this.fetchCoupons() });
    }
  }
}
