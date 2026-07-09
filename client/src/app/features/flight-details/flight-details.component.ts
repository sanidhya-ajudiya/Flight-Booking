import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';

import { FlightService } from '../../core/services/flight.service';
import { Flight } from '../../core/models';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-flight-details',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatTabsModule, MatDividerModule],
  template: `
    <div class="details-page container animate-fadeIn" *ngIf="flight()">
      <div class="back-link flex-start gap-sm">
        <a routerLink="/results"><mat-icon>arrow_back</mat-icon> Back to Search Results</a>
      </div>

      <!-- Main Layout -->
      <div class="details-layout">
        <!-- Flight Summary & Timeline -->
        <div class="details-left flex-col gap-lg">
          <div class="glass-card timeline-card">
            <h2 class="section-sub-title flex-start gap-sm">
              <mat-icon>schedule</mat-icon> Flight Timeline
            </h2>

            <div class="timeline-visual">
              <!-- Origin Point -->
              <div class="timeline-node origin">
                <div class="node-time-col">
                  <h3>{{ flight()?.segments?.[0]?.departureTime | date:'HH:mm' }}</h3>
                  <span>{{ flight()?.segments?.[0]?.departureTime | date:'dd MMM' }}</span>
                </div>
                <div class="node-bar">
                  <div class="node-dot active"></div>
                  <div class="node-line"></div>
                </div>
                <div class="node-info-col">
                  <h4>{{ flight()?.segments?.[0]?.origin?.city }} ({{ flight()?.segments?.[0]?.origin?.code }})</h4>
                  <p>{{ flight()?.segments?.[0]?.origin?.name }}</p>
                </div>
              </div>

              <!-- In-Flight Segment Details -->
              <div class="segment-block flex-start gap-lg">
                <div class="segment-icon flex-center">
                  <mat-icon>flight</mat-icon>
                </div>
                <div class="segment-info">
                  <span class="segment-badge">
                    ⏱️ {{ getFormattedDuration(flight()?.segments?.[0]?.duration!) }} • 
                    🛫 {{ flight()?.segments?.[0]?.airline?.name }} {{ flight()?.segments?.[0]?.flightNumber }}
                  </span>
                  <p class="aircraft-desc">Aircraft Type: <strong>{{ flight()?.segments?.[0]?.aircraft }}</strong></p>
                </div>
              </div>

              <!-- Destination Point -->
              <div class="timeline-node destination">
                <div class="node-time-col">
                  <h3>{{ flight()?.segments?.[0]?.arrivalTime | date:'HH:mm' }}</h3>
                  <span>{{ flight()?.segments?.[0]?.arrivalTime | date:'dd MMM' }}</span>
                </div>
                <div class="node-bar">
                  <div class="node-dot active"></div>
                </div>
                <div class="node-info-col">
                  <h4>{{ flight()?.segments?.[0]?.destination?.city }} ({{ flight()?.segments?.[0]?.destination?.code }})</h4>
                  <p>{{ flight()?.segments?.[0]?.destination?.name }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Refund & Policy Tabs -->
          <div class="glass-card tabs-card">
            <mat-tab-group class="policy-tabs">
              <!-- Baggage -->
              <mat-tab label="Baggage Policy">
                <div class="tab-pane-content flex-col gap-md">
                  <div class="baggage-rule flex-between">
                    <div class="flex-start gap-md">
                      <mat-icon class="policy-icon">work</mat-icon>
                      <div>
                        <strong>Cabin Baggage</strong>
                        <p>1 piece per passenger</p>
                      </div>
                    </div>
                    <span class="weight-limit">{{ flight()?.segments?.[0]?.baggageAllowance?.cabin }}</span>
                  </div>
                  <mat-divider></mat-divider>
                  <div class="baggage-rule flex-between">
                    <div class="flex-start gap-md">
                      <mat-icon class="policy-icon">luggage</mat-icon>
                      <div>
                        <strong>Checked Baggage</strong>
                        <p>Standard allowance limit</p>
                      </div>
                    </div>
                    <span class="weight-limit">{{ flight()?.segments?.[0]?.baggageAllowance?.checkedIn }}</span>
                  </div>
                </div>
              </mat-tab>

              <!-- Fare Rules & Refunds -->
              <mat-tab label="Refund & Cancellation">
                <div class="tab-pane-content flex-col gap-sm">
                  <div class="policy-alert" [class.refundable]="flight()?.refundable">
                    <mat-icon>{{ flight()?.refundable ? 'check_circle' : 'cancel' }}</mat-icon>
                    <div>
                      <strong>{{ flight()?.refundable ? 'Refundable Ticket' : 'Non-refundable Saver Fare' }}</strong>
                      <p>{{ flight()?.refundable ? 'Cancellations allowed up to 4 hours before departure for a fee.' : 'No cancellation refund is allowed for this ticket class.' }}</p>
                    </div>
                  </div>
                  <ul class="policy-bullet-list">
                    <li>Date change allowed up to 24 hours prior with standard fare difference.</li>
                    <li>No Show fees are applicable if cancelled within 4 hours.</li>
                    <li>Complimentary meal is included for Flexi ticket classes.</li>
                  </ul>
                </div>
              </mat-tab>
            </mat-tab-group>
          </div>
        </div>

        <!-- Sticky Right Details Panel -->
        <div class="details-right-sidebar">
          <div class="glass-card summary-card flex-col gap-lg">
            <div class="summary-head">
              <span class="class-badge badge badge-primary">{{ flight()?.cabinClass | titlecase }}</span>
              <h3>Fare Summary</h3>
            </div>
            
            <div class="price-breakdown flex-col gap-sm">
              <div class="flex-between">
                <span>Base Fare (1 Pax)</span>
                <span>₹{{ flight()?.price?.base | number }}</span>
              </div>
              <div class="flex-between">
                <span>Taxes & Airport Fees</span>
                <span>₹{{ flight()?.price?.taxes | number }}</span>
              </div>
              <div class="flex-between">
                <span>GST (5%)</span>
                <span>₹{{ flight()?.price?.gst | number }}</span>
              </div>
              <mat-divider></mat-divider>
              <div class="flex-between total-row">
                <span>Total Fare</span>
                <span class="total-price">₹{{ flight()?.price?.total | number }}</span>
              </div>
            </div>

            <button class="btn-gradient w-full text-center" (click)="proceedToSeats()">
              Select Seats <mat-icon class="btn-icon">arrow_forward</mat-icon>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Fallback if not found -->
    <div class="empty-state container text-center" *ngIf="!flight()">
      <h2>Flight Details Not Found</h2>
      <button routerLink="/search" class="btn-gradient">New Search</button>
    </div>
  `,
  styles: [`
    .details-page {
      padding-top: var(--space-4xl);
      padding-bottom: var(--space-4xl);
    }

    .back-link {
      margin-bottom: var(--space-xl);
      a {
        color: var(--text-secondary);
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 6px;
        &:hover { color: var(--color-primary); }
      }
    }

    .details-layout {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: var(--space-xl);

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
      }
    }

    .timeline-card {
      padding: var(--space-2xl) !important;
    }

    .section-sub-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: var(--space-xl);

      mat-icon { color: var(--color-primary); }
    }

    // Timeline visual
    .timeline-visual {
      display: flex;
      flex-direction: column;
      position: relative;
      margin-left: 20px;
    }

    .timeline-node {
      display: flex;
      gap: var(--space-lg);
      position: relative;

      .node-time-col {
        width: 80px;
        h3 { font-size: 1.2rem; font-weight: 700; color: var(--text-primary); line-height: 1.1; }
        span { font-size: 0.75rem; color: var(--text-secondary); font-weight: 500; }
      }

      .node-bar {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 20px;

        .node-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--border-color);
          border: 2px solid var(--bg-card);

          &.active {
            background: var(--color-primary);
            box-shadow: 0 0 0 4px rgba(21, 101, 192, 0.15);
          }
        }

        .node-line {
          width: 2px;
          flex: 1;
          min-height: 100px;
          background: var(--border-color);
        }
      }

      .node-info-col {
        flex: 1;
        h4 { font-size: 1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 2px; }
        p { font-size: 0.8rem; color: var(--text-secondary); }
      }
    }

    .segment-block {
      margin: 12px 0 12px 100px;
      padding: var(--space-sm) var(--space-md);
      background: var(--bg-primary);
      border-radius: var(--border-radius-md);
      border: 1px solid var(--border-color);

      .segment-icon {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: var(--bg-card);
        color: var(--color-primary);
        mat-icon { font-size: 18px; width: 18px; height: 18px; transform: rotate(90deg); }
      }

      .segment-badge {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--color-primary-dark);
      }

      .aircraft-desc {
        font-size: 0.75rem;
        color: var(--text-secondary);
        margin-top: 2px;
      }
    }

    .tabs-card {
      padding: 0 !important;
      overflow: hidden;
    }

    .policy-tabs {
      ::ng-deep .mat-mdc-tab-body-wrapper {
        padding: var(--space-xl);
      }
    }

    .tab-pane-content {
      gap: var(--space-md);
    }

    .baggage-rule {
      .policy-icon { color: var(--color-primary); }
      strong { font-size: 0.9rem; color: var(--text-primary); }
      p { font-size: 0.75rem; color: var(--text-secondary); }
      .weight-limit { font-size: 1.1rem; font-weight: 700; color: var(--color-primary); }
    }

    .policy-alert {
      display: flex;
      align-items: flex-start;
      gap: var(--space-md);
      padding: var(--space-md);
      border-radius: var(--border-radius-md);
      background: rgba(255, 23, 68, 0.05);
      border: 1px solid rgba(255, 23, 68, 0.1);
      color: var(--color-warn);

      mat-icon { font-size: 24px; width: 24px; height: 24px; }
      strong { font-size: 0.95rem; color: var(--text-primary); }
      p { font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px; }

      &.refundable {
        background: rgba(0, 200, 83, 0.05);
        border-color: rgba(0, 200, 83, 0.1);
        color: var(--color-success);
      }
    }

    .policy-bullet-list {
      padding-left: 20px;
      font-size: 0.8rem;
      color: var(--text-secondary);
      li { margin-bottom: 6px; }
    }

    // Sidebar Summary Card
    .details-right-sidebar {
      position: sticky;
      top: 90px;
      height: fit-content;
    }

    .summary-card {
      padding: var(--space-xl) !important;

      .summary-head {
        border-bottom: 1px solid var(--border-color);
        padding-bottom: var(--space-sm);
        h3 { font-size: 1.2rem; font-weight: 700; color: var(--text-primary); margin-top: 4px; }
      }
    }

    .price-breakdown {
      font-size: 0.85rem;
      color: var(--text-secondary);

      .total-row {
        font-weight: 700;
        color: var(--text-primary);
        font-size: 1rem;
        margin-top: 4px;

        .total-price { font-size: 1.4rem; color: var(--color-primary-dark); }
      }
    }

    .btn-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      margin-left: 4px;
    }
  `]
})
export class FlightDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private flightService = inject(FlightService);

  flight = signal<Flight | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const match = this.flightService.getFlightById(id);
      if (match) {
        this.flight.set(match);
      } else {
        // Mock fallback if user lands on detailed view after reload
        const defaultFlight = this.flightService.searchResults()[0];
        if (defaultFlight) this.flight.set(defaultFlight);
      }
    }
  }

  getFormattedDuration(mins: number): string {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return `${hours}h ${minutes}m`;
  }

  proceedToSeats(): void {
    this.router.navigate(['/seats', this.flight()?.id]);
  }
}
