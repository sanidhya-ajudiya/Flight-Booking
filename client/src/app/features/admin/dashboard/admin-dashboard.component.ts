import { Component, OnInit, inject, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { DashboardKPIs } from '../../../core/interfaces';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-container">
      <div class="admin-header">
        <div>
          <h2>Admin Control Center ✈️</h2>
          <p>System overview, flight occupancy metrics, and revenue analytics</p>
        </div>
        <a routerLink="/admin/flights" class="btn-primary">+ Add New Flight</a>
      </div>

      <!-- KPI Summary Cards Grid -->
      <div class="kpi-grid" *ngIf="kpis">
        <div class="kpi-card glass-card">
          <span class="kpi-icon">✈️</span>
          <div>
            <span class="kpi-label">Total Flights</span>
            <h3 class="kpi-value">{{ kpis.totalFlights }}</h3>
          </div>
        </div>

        <div class="kpi-card glass-card">
          <span class="kpi-icon">🛫</span>
          <div>
            <span class="kpi-label">Active Flights</span>
            <h3 class="kpi-value">{{ kpis.activeFlights }}</h3>
          </div>
        </div>

        <div class="kpi-card glass-card">
          <span class="kpi-icon">📋</span>
          <div>
            <span class="kpi-label">Total Bookings</span>
            <h3 class="kpi-value">{{ kpis.totalBookings }}</h3>
          </div>
        </div>

        <div class="kpi-card glass-card">
          <span class="kpi-icon">💰</span>
          <div>
            <span class="kpi-label">Total Revenue</span>
            <h3 class="kpi-value">₹{{ kpis.revenue }}</h3>
          </div>
        </div>

        <div class="kpi-card glass-card" routerLink="/admin/users" style="cursor: pointer;" title="Manage User Accounts">
          <span class="kpi-icon">👥</span>
          <div>
            <span class="kpi-label">Registered Customers ➔</span>
            <h3 class="kpi-value">{{ kpis.customers }}</h3>
          </div>
        </div>

        <div class="kpi-card glass-card">
          <span class="kpi-icon">⚠️</span>
          <div>
            <span class="kpi-label">Refund Requests</span>
            <h3 class="kpi-value">{{ kpis.refundRequests }}</h3>
          </div>
        </div>
      </div>

      <!-- Analytics Charts Section -->
      <div class="charts-grid">
        <div class="chart-card glass-card">
          <h3>Monthly Revenue Trend (₹)</h3>
          <canvas #revenueCanvas height="220"></canvas>
        </div>

        <div class="chart-card glass-card">
          <h3>Popular Routes & Occupancy</h3>
          <div class="routes-list">
            <div *ngFor="let route of popularRoutes" class="route-progress-item">
              <div class="route-flex">
                <span>{{ route.route }}</span>
                <strong>{{ route.bookings }} Bookings ({{ route.percentage }}%)</strong>
              </div>
              <div class="progress-bar-bg">
                <div class="progress-fill" [style.width.%]="route.percentage * 2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Bookings Table -->
      <div class="recent-table-card glass-card">
        <h3>Recent Booking Activities</h3>
        <table class="admin-table">
          <thead>
            <tr>
              <th>PNR</th>
              <th>Customer</th>
              <th>Flight</th>
              <th>Class</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let b of recentBookings">
              <td><strong>{{ b.pnr }}</strong></td>
              <td>{{ b.user?.name }} ({{ b.user?.email }})</td>
              <td>{{ b.flight?.flightNumber }}</td>
              <td><span class="badge badge-info">{{ b.cabinClass | uppercase }}</span></td>
              <td>₹{{ b.totalAmount }}</td>
              <td><span class="badge" [ngClass]="b.status === 'Confirmed' ? 'badge-success' : 'badge-danger'">{{ b.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .admin-container { padding: 40px 0; }
    .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; h2 { font-size: 2rem; font-weight: 800; } p { color: var(--text-secondary); } }

    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .kpi-card { padding: 20px; display: flex; align-items: center; gap: 16px; }
    .kpi-icon { font-size: 2rem; }
    .kpi-label { font-size: 0.78rem; font-weight: 700; color: var(--text-muted); }
    .kpi-value { font-size: 1.6rem; font-weight: 800; color: var(--primary-accent); margin-top: 2px; }

    .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
    .chart-card { padding: 24px; h3 { font-size: 1.1rem; font-weight: 800; margin-bottom: 16px; } }

    .routes-list { display: flex; flex-direction: column; gap: 16px; margin-top: 12px; }
    .route-flex { display: flex; justify-content: space-between; font-size: 0.88rem; font-weight: 600; margin-bottom: 6px; }
    .progress-bar-bg { height: 8px; background: var(--bg-primary); border-radius: 4px; overflow: hidden; }
    .progress-fill { height: 100%; background: var(--primary-gradient); border-radius: 4px; }

    .recent-table-card { padding: 24px; h3 { font-size: 1.1rem; font-weight: 800; margin-bottom: 16px; } }
    .admin-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
      th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid var(--border-color); }
      th { font-weight: 700; color: var(--text-muted); background: var(--bg-primary); }
    }

    @media (max-width: 900px) {
      .charts-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('revenueCanvas') revenueCanvas!: ElementRef<HTMLCanvasElement>;
  analyticsService = inject(AnalyticsService);

  kpis: DashboardKPIs | null = null;
  monthlyBookings: any[] = [];
  popularRoutes: any[] = [];
  recentBookings: any[] = [];

  ngOnInit() {
    this.analyticsService.getDashboardData().subscribe({
      next: (data) => {
        this.kpis = data.kpis;
        this.monthlyBookings = data.monthlyBookings || [];
        this.popularRoutes = data.popularRoutes || [];
        this.recentBookings = data.recentBookings || [];
        this.renderChart();
      },
      error: (err) => console.error(err)
    });
  }

  ngAfterViewInit() {
    this.renderChart();
  }

  renderChart() {
    if (!this.revenueCanvas || this.monthlyBookings.length === 0) return;
    const ctx = this.revenueCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const width = this.revenueCanvas.nativeElement.width = 500;
    const height = this.revenueCanvas.nativeElement.height = 220;

    ctx.clearRect(0, 0, width, height);

    // Draw Bar Graph
    const maxVal = Math.max(...this.monthlyBookings.map(m => m.revenue)) || 1000000;
    const barWidth = 40;
    const gap = 30;
    const startX = 40;

    this.monthlyBookings.forEach((item, index) => {
      const x = startX + index * (barWidth + gap);
      const barHeight = (item.revenue / maxVal) * 140;
      const y = height - 40 - barHeight;

      // Draw Bar
      const grad = ctx.createLinearGradient(0, y, 0, height - 40);
      grad.addColorStop(0, '#0284c7');
      grad.addColorStop(1, '#38bdf8');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Label Month
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px Plus Jakarta Sans';
      ctx.fillText(item.month, x + 8, height - 15);
    });
  }
}
