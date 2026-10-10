import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { User, Wallet } from '../../core/interfaces';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container profile-page">
      <div class="profile-grid">

        <!-- User Profile Card -->
        <div class="profile-card glass-card">
          <div class="user-avatar-header">
            <img [src]="user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'" alt="Avatar" class="avatar-large">
            <h3 class="user-name">{{ user?.name }}</h3>
            <span class="user-role-badge">{{ user?.role | uppercase }}</span>
          </div>

          <form (ngSubmit)="onUpdateProfile()" class="profile-form">
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" [(ngModel)]="name" name="name" class="custom-input">
            </div>

            <div class="form-group">
              <label>Email Address</label>
              <input type="email" [value]="user?.email" disabled class="custom-input disabled">
            </div>

            <div class="form-group">
              <label>Phone Number</label>
              <input type="text" [(ngModel)]="phone" name="phone" class="custom-input">
            </div>

            <div class="form-group">
              <label>Passport Number</label>
              <input type="text" [(ngModel)]="passportNumber" name="passportNumber" class="custom-input">
            </div>

            <div class="form-group">
              <label>Nationality</label>
              <input type="text" [(ngModel)]="nationality" name="nationality" class="custom-input">
            </div>

            <button type="submit" [disabled]="saving" class="btn-primary update-btn">
              {{ saving ? 'Saving Changes...' : 'SAVE PROFILE CHANGES' }}
            </button>
          </form>
        </div>

        <!-- SkyWings Wallet Ledger Card -->
        <div class="wallet-card glass-card">
          <div class="wallet-header">
            <div>
              <span class="wallet-label">SKYWINGS DIGITAL WALLET</span>
              <h2 class="wallet-balance">₹{{ wallet?.balance || user?.walletBalance || 0 }}</h2>
            </div>
            <div class="wallet-icon-badge">👛</div>
          </div>

          <!-- Top-up Wallet Section -->
          <div class="topup-box">
            <h5 class="topup-title">⚡ Quick Wallet Recharge</h5>
            <div class="quick-amounts">
              <button type="button" (click)="topupAmount = 500" class="chip-btn" [class.active]="topupAmount === 500">+₹500</button>
              <button type="button" (click)="topupAmount = 1000" class="chip-btn" [class.active]="topupAmount === 1000">+₹1,000</button>
              <button type="button" (click)="topupAmount = 2000" class="chip-btn" [class.active]="topupAmount === 2000">+₹2,000</button>
              <button type="button" (click)="topupAmount = 5000" class="chip-btn" [class.active]="topupAmount === 5000">+₹5,000</button>
            </div>
            <div class="topup-input-row">
              <div class="amount-field">
                <span class="currency-prefix">₹</span>
                <input type="number" [(ngModel)]="topupAmount" placeholder="Enter amount" min="100" class="custom-input amount-input">
              </div>
              <button (click)="onRechargeWallet()" [disabled]="recharging || !topupAmount" class="btn-primary recharge-btn">
                {{ recharging ? 'Processing...' : 'Add Money ➔' }}
              </button>
            </div>
            <div *ngIf="topupSuccess" class="topup-alert-success">
              {{ topupSuccess }}
            </div>
          </div>

          <h4 class="ledger-title">Transaction Ledger</h4>

          <div *ngIf="!wallet || wallet.transactions.length === 0" class="no-tx">
            No wallet transactions found.
          </div>

          <div class="tx-list" *ngIf="wallet && wallet.transactions.length > 0">
            <div *ngFor="let tx of wallet.transactions" class="tx-item">
              <div class="tx-info">
                <span class="tx-desc">{{ tx.description }}</span>
                <span class="tx-date">{{ tx.date | date:'short' }}</span>
              </div>
              <span class="tx-amount" [class.credit]="tx.type === 'Credit'">
                {{ tx.type === 'Credit' ? '+' : '-' }}₹{{ tx.amount }}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .profile-page { padding-top: 40px; }

    .profile-grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 30px;
    }

    .profile-card, .wallet-card { padding: 32px; }

    .user-avatar-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 24px;
    }

    .avatar-large {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid var(--primary-accent);
      margin-bottom: 12px;
    }

    .user-name { font-size: 1.4rem; font-weight: 800; }

    .user-role-badge {
      background: rgba(2, 132, 199, 0.15);
      color: var(--primary-accent);
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 700;
      margin-top: 6px;
    }

    .profile-form { display: flex; flex-direction: column; gap: 16px; }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      label { font-size: 0.8rem; font-weight: 700; color: var(--text-muted); }
    }

    .custom-input {
      height: 44px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: var(--bg-primary);
      color: var(--text-primary);
      padding: 0 12px;
      font-weight: 600;

      &.disabled { background: var(--border-color); cursor: not-allowed; }
    }

    .update-btn { margin-top: 10px; justify-content: center; }

    .wallet-header {
      background: var(--hero-gradient);
      padding: 24px;
      border-radius: 16px;
      color: #ffffff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .wallet-label { font-size: 0.75rem; font-weight: 800; letter-spacing: 1px; color: #38bdf8; }
    .wallet-balance { font-size: 2.2rem; font-weight: 800; margin-top: 4px; }
    .wallet-icon-badge { font-size: 2.5rem; }

    .ledger-title { font-size: 1.1rem; font-weight: 800; margin-bottom: 16px; }
    .no-tx { color: var(--text-muted); font-size: 0.9rem; }

    .tx-list { display: flex; flex-direction: column; gap: 12px; }

    .tx-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: var(--bg-primary);
      border-radius: 10px;
      border: 1px solid var(--border-color);
    }

    .tx-info { display: flex; flex-direction: column; }
    .tx-desc { font-weight: 700; font-size: 0.9rem; }
    .tx-date { font-size: 0.75rem; color: var(--text-muted); }

    .tx-amount { font-weight: 800; font-size: 1rem; color: #ef4444; &.credit { color: #16a34a; } }

    .topup-box { background: rgba(56, 189, 248, 0.05); border: 1px dashed var(--border-color); border-radius: 14px; padding: 18px; margin-bottom: 24px; }
    .topup-title { font-size: 0.95rem; font-weight: 700; margin-bottom: 12px; color: var(--primary); }
    .quick-amounts { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
    .chip-btn { background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-color); border-radius: 20px; padding: 6px 14px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: 0.2s; }
    .chip-btn:hover, .chip-btn.active { background: var(--primary); color: #fff; border-color: var(--primary); }
    .topup-input-row { display: flex; gap: 10px; align-items: center; }
    .amount-field { position: relative; flex: 1; }
    .currency-prefix { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-weight: bold; color: var(--text-muted); }
    .amount-input { padding-left: 28px !important; }
    .recharge-btn { white-space: nowrap; padding: 10px 18px; }
    .topup-alert-success { margin-top: 10px; color: #4ade80; font-size: 0.85rem; font-weight: 600; }

    @media (max-width: 900px) {
      .profile-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ProfileComponent implements OnInit {
  authService = inject(AuthService);
  http = inject(HttpClient);

  user: User | null = null;
  wallet: Wallet | null = null;

  name: string = '';
  phone: string = '';
  passportNumber: string = '';
  nationality: string = '';
  saving: boolean = false;

  topupAmount: number = 1000;
  recharging: boolean = false;
  topupSuccess: string = '';

  ngOnInit() {
    this.user = this.authService.currentUser();
    if (this.user) {
      this.name = this.user.name || '';
      this.phone = this.user.phone || '';
      this.passportNumber = this.user.passportNumber || '';
      this.nationality = this.user.nationality || 'Indian';
    }

    this.fetchWallet();
  }

  fetchWallet() {
    this.http.get<Wallet>(`${environment.apiUrl}/users/wallet`).subscribe({
      next: data => this.wallet = data,
      error: err => console.error(err)
    });
  }

  onRechargeWallet() {
    if (!this.topupAmount || this.topupAmount <= 0) return;
    this.recharging = true;
    this.topupSuccess = '';

    this.authService.addWalletMoney(this.topupAmount, 'UPI/Card').subscribe({
      next: (res: any) => {
        this.recharging = false;
        this.topupSuccess = res.message || `₹${this.topupAmount} added successfully!`;
        if (this.wallet && res.wallet) {
          this.wallet = res.wallet;
        } else {
          this.fetchWallet();
        }
        setTimeout(() => this.topupSuccess = '', 4000);
      },
      error: (err: any) => {
        this.recharging = false;
        alert(err.error?.message || 'Failed to recharge wallet');
      }
    });
  }

  onUpdateProfile() {
    this.saving = true;
    const payload = {
      name: this.name,
      phone: this.phone,
      passportNumber: this.passportNumber,
      nationality: this.nationality
    };

    this.authService.updateProfile(payload).subscribe({
      next: updated => {
        this.user = updated;
        this.saving = false;
        alert('Profile updated successfully!');
      },
      error: err => {
        alert(err.error?.message || 'Update failed');
        this.saving = false;
      }
    });
  }
}
