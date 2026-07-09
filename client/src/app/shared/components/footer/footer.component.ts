import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, MatIconModule, MatButtonModule, FormsModule],
  template: `
    <footer class="footer">
      <!-- Newsletter -->
      <div class="newsletter-section">
        <div class="container">
          <div class="newsletter-content">
            <div class="newsletter-text">
              <h3>✈️ Get Exclusive Deals</h3>
              <p>Subscribe and save up to 40% on your next flight booking</p>
            </div>
            <div class="newsletter-form">
              <input type="email" [(ngModel)]="email" placeholder="Enter your email address"
                     class="newsletter-input" aria-label="Newsletter email">
              <button class="btn-gradient" (click)="subscribe()">Subscribe Now</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Footer -->
      <div class="footer-main">
        <div class="container">
          <div class="footer-grid">
            <!-- Brand -->
            <div class="footer-brand">
              <div class="footer-logo">
                <span>✈️</span>
                <span class="brand-name">SkyWings</span>
              </div>
              <p>Your trusted partner for premium flight bookings. Fly to 500+ destinations worldwide with the best prices guaranteed.</p>
              <div class="social-links">
                <a href="#" class="social-link" aria-label="Facebook">
                  <mat-icon>facebook</mat-icon>
                </a>
                <a href="#" class="social-link" aria-label="Twitter">
                  <mat-icon>flutter_dash</mat-icon>
                </a>
                <a href="#" class="social-link" aria-label="Instagram">
                  <mat-icon>photo_camera</mat-icon>
                </a>
                <a href="#" class="social-link" aria-label="LinkedIn">
                  <mat-icon>work</mat-icon>
                </a>
                <a href="#" class="social-link" aria-label="YouTube">
                  <mat-icon>play_circle</mat-icon>
                </a>
              </div>
              <div class="app-badges">
                <a href="#" class="app-badge">
                  <mat-icon>phone_android</mat-icon>
                  <div>
                    <span class="badge-sub">Get it on</span>
                    <span class="badge-store">Google Play</span>
                  </div>
                </a>
                <a href="#" class="app-badge">
                  <mat-icon>apple</mat-icon>
                  <div>
                    <span class="badge-sub">Download on the</span>
                    <span class="badge-store">App Store</span>
                  </div>
                </a>
              </div>
            </div>

            <!-- Quick Links -->
            <div class="footer-links">
              <h4>Quick Links</h4>
              <ul>
                <li><a routerLink="/">Home</a></li>
                <li><a routerLink="/search">Search Flights</a></li>
                <li><a href="#">Popular Destinations</a></li>
                <li><a href="#">Travel Deals</a></li>
                <li><a href="#">Flight Status</a></li>
                <li><a href="#">Airport Guide</a></li>
              </ul>
            </div>

            <!-- Support -->
            <div class="footer-links">
              <h4>Support</h4>
              <ul>
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Manage Booking</a></li>
                <li><a href="#">Cancellation Policy</a></li>
                <li><a href="#">Baggage Policy</a></li>
                <li><a href="#">Travel Insurance</a></li>
                <li><a href="#">Contact Us</a></li>
              </ul>
            </div>

            <!-- Company -->
            <div class="footer-links">
              <h4>Company</h4>
              <ul>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Press & Media</a></li>
                <li><a href="#">Investor Relations</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
              </ul>
            </div>

            <!-- Contact -->
            <div class="footer-contact">
              <h4>Contact Us</h4>
              <div class="contact-items">
                <div class="contact-item">
                  <mat-icon>phone</mat-icon>
                  <div>
                    <span>24/7 Support</span>
                    <a href="tel:+918001234567">+91 800 123 4567</a>
                  </div>
                </div>
                <div class="contact-item">
                  <mat-icon>email</mat-icon>
                  <div>
                    <span>Email</span>
                    <a href="mailto:support@skywings.com">support&#64;skywings.com</a>
                  </div>
                </div>
                <div class="contact-item">
                  <mat-icon>chat</mat-icon>
                  <div>
                    <span>Live Chat</span>
                    <a href="#">Start Chat</a>
                  </div>
                </div>
              </div>

              <!-- Certifications -->
              <div class="certifications">
                <div class="cert-badge">🔒 SSL Secured</div>
                <div class="cert-badge">✅ IATA Member</div>
                <div class="cert-badge">🏆 Best OTA 2024</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Bottom -->
      <div class="footer-bottom">
        <div class="container">
          <div class="footer-bottom-content">
            <p>© 2024 SkyWings. All rights reserved. Made with ❤️ in India.</p>
            <div class="payment-methods">
              <span class="payment-icon">💳 Visa</span>
              <span class="payment-icon">💳 Mastercard</span>
              <span class="payment-icon">📱 UPI</span>
              <span class="payment-icon">🏦 NetBanking</span>
              <span class="payment-icon">💰 PayPal</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: var(--bg-secondary);
      border-top: 1px solid var(--border-color);
      margin-top: auto;
    }

    // Newsletter
    .newsletter-section {
      background: var(--gradient-primary);
      padding: 48px 0;
    }

    .newsletter-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 32px;
      flex-wrap: wrap;

      h3 {
        font-size: 1.6rem;
        font-weight: 700;
        color: white;
        margin-bottom: 8px;
      }

      p { color: rgba(255,255,255,0.85); font-size: 1rem; }
    }

    .newsletter-form {
      display: flex;
      gap: 12px;
      flex: 1;
      max-width: 500px;

      @media (max-width: 600px) { flex-direction: column; }
    }

    .newsletter-input {
      flex: 1;
      padding: 14px 20px;
      border: none;
      border-radius: 50px;
      font-family: var(--font-family);
      font-size: 0.95rem;
      outline: none;
      background: rgba(255,255,255,0.95);
      color: var(--text-primary);

      &::placeholder { color: var(--text-muted); }
    }

    // Main footer
    .footer-main { padding: 64px 0 48px; }

    .footer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr;
      gap: 40px;

      @media (max-width: 1200px) { grid-template-columns: 1fr 1fr 1fr; }
      @media (max-width: 768px)  { grid-template-columns: 1fr 1fr; }
      @media (max-width: 480px)  { grid-template-columns: 1fr; }
    }

    .footer-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
      font-size: 24px;

      .brand-name {
        font-size: 1.5rem;
        font-weight: 800;
        background: var(--gradient-primary);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }

    .footer-brand p {
      color: var(--text-secondary);
      font-size: 0.9rem;
      line-height: 1.7;
      margin-bottom: 20px;
      max-width: 280px;
    }

    .social-links {
      display: flex;
      gap: 10px;
      margin-bottom: 24px;
    }

    .social-link {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: var(--bg-overlay);
      border: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
      transition: all var(--transition-base);
      text-decoration: none;

      mat-icon { font-size: 18px; width: 18px; height: 18px; }

      &:hover {
        background: var(--gradient-primary);
        color: white;
        border-color: transparent;
        transform: translateY(-3px);
        box-shadow: var(--shadow-md);
      }
    }

    .app-badges {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .app-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-sm);
      text-decoration: none;
      color: var(--text-primary);
      transition: all var(--transition-base);
      background: var(--bg-card);

      mat-icon { font-size: 22px; color: var(--color-primary); }

      .badge-sub { display: block; font-size: 0.65rem; color: var(--text-secondary); }
      .badge-store { display: block; font-size: 0.85rem; font-weight: 600; }

      &:hover { border-color: var(--color-primary); transform: translateY(-2px); box-shadow: var(--shadow-sm); }
    }

    .footer-links {
      h4 {
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 20px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      ul { list-style: none; }
      li { margin-bottom: 10px; }

      a {
        color: var(--text-secondary);
        font-size: 0.9rem;
        text-decoration: none;
        transition: color var(--transition-fast), padding-left var(--transition-fast);

        &:hover { color: var(--color-primary); padding-left: 4px; }
      }
    }

    .footer-contact {
      h4 {
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 20px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }

    .contact-items { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }

    .contact-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;

      mat-icon {
        color: var(--color-primary);
        font-size: 20px;
        width: 20px;
        height: 20px;
        margin-top: 2px;
      }

      span {
        display: block;
        font-size: 0.75rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 2px;
      }

      a {
        color: var(--text-primary);
        font-size: 0.9rem;
        font-weight: 500;
        text-decoration: none;
        transition: color var(--transition-fast);

        &:hover { color: var(--color-primary); }
      }
    }

    .certifications {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .cert-badge {
      padding: 4px 12px;
      background: var(--bg-overlay);
      border: 1px solid var(--border-color);
      border-radius: 50px;
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    // Footer bottom
    .footer-bottom {
      padding: 20px 0;
      border-top: 1px solid var(--border-color);
      background: var(--bg-primary);
    }

    .footer-bottom-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;

      p { color: var(--text-muted); font-size: 0.85rem; }
    }

    .payment-methods {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .payment-icon {
      font-size: 0.8rem;
      color: var(--text-secondary);
      padding: 4px 10px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      white-space: nowrap;
    }
  `]
})
export class FooterComponent {
  email = '';

  subscribe(): void {
    if (this.email) {
      alert('Thank you for subscribing! 🎉');
      this.email = '';
    }
  }
}
