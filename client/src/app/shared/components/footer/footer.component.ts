import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="app-footer">
      <div class="container footer-grid">
        <div class="footer-col brand-col">
          <div class="brand-title">✈️ SKYWINGS AIRLINES</div>
          <p class="brand-desc">
            Experience next-generation air travel with seamless booking, modern fleet, and world-class hospitality.
          </p>
          <div class="social-icons">
            <span class="social-badge">🌐 Website</span>
            <span class="social-badge">📱 Mobile App</span>
            <span class="social-badge">🔒 256-bit Secure</span>
          </div>
        </div>

        <div class="footer-col">
          <h4 class="footer-heading">Quick Links</h4>
          <ul class="footer-links">
            <li><a routerLink="/search">Search Flights</a></li>
            <li><a routerLink="/my-bookings">Manage Booking</a></li>
            <li><a routerLink="/profile">My Wallet & Profile</a></li>
            <li><a routerLink="/login">Customer Login</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4 class="footer-heading">Flight Routes</h4>
          <ul class="footer-links">
            <li><span>Mumbai (BOM) → Delhi (DEL)</span></li>
            <li><span>Mumbai (BOM) → Dubai (DXB)</span></li>
            <li><span>Delhi (DEL) → Singapore (SIN)</span></li>
            <li><span>Bengaluru (BLR) → London (LHR)</span></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4 class="footer-heading">Customer Support</h4>
          <p class="contact-info">📞 24/7 Helpline: 1800-SKYWINGS</p>
          <p class="contact-info">✉️ Email: support&#64;skywings.com</p>
          <p class="contact-info">📍 HQ: SkyWings Towers, International Airport Zone</p>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="container bottom-flex">
          <span>© 2026 SkyWings Airlines System. All Rights Reserved.</span>
          <div class="legal-links">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Refund Rules</span>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .app-footer {
      background: #0f172a;
      color: #94a3b8;
      padding-top: 60px;
      margin-top: 80px;
      border-top: 1px solid #1e293b;
    }

    .footer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1.5fr 1.5fr;
      gap: 40px;
      padding-bottom: 40px;
    }

    .brand-title {
      font-size: 1.3rem;
      font-weight: 800;
      color: #f8fafc;
      margin-bottom: 12px;
    }

    .brand-desc {
      font-size: 0.9rem;
      line-height: 1.6;
      margin-bottom: 20px;
    }

    .social-icons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .social-badge {
      background: #1e293b;
      color: #38bdf8;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .footer-heading {
      color: #f8fafc;
      font-size: 1.05rem;
      font-weight: 700;
      margin-bottom: 16px;
    }

    .footer-links {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 10px;

      a, span {
        font-size: 0.9rem;
        color: #94a3b8;
        &:hover { color: #38bdf8; }
      }
    }

    .contact-info {
      font-size: 0.88rem;
      margin-bottom: 10px;
    }

    .footer-bottom {
      background: #090d16;
      padding: 20px 0;
      border-top: 1px solid #1e293b;
    }

    .bottom-flex {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
    }

    .legal-links {
      display: flex;
      gap: 20px;
    }

    @media (max-width: 900px) {
      .footer-grid { grid-template-columns: 1fr 1fr; }
    }

    @media (max-width: 600px) {
      .footer-grid { grid-template-columns: 1fr; }
      .bottom-flex { flex-direction: column; gap: 10px; text-align: center; }
    }
  `]
})
export class FooterComponent {}
