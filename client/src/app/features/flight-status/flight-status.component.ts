import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FlightService } from '../../core/services/flight.service';
import { Flight } from '../../core/interfaces';

@Component({
  selector: 'app-flight-status',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="status-page container">
      <!-- Header -->
      <div class="status-header text-center">
        <span class="badge-tag">📡 REAL-TIME RADAR</span>
        <h1>Live Flight Tracker & Status</h1>
        <p>Check the real-time operational status, delays, and gate assignments for all scheduled flights.</p>
      </div>

      <!-- Search Controls -->
      <div class="search-card glass-card">
        <form (ngSubmit)="onSearch()" class="search-form">
          <div class="form-group flex-2">
            <label>Flight Number</label>
            <input 
              type="text" 
              [(ngModel)]="flightNumber" 
              name="fnum" 
              placeholder="e.g. AI-101, 6E-205, EK-501" 
              class="custom-input uppercase"
            >
          </div>

          <div class="form-group flex-1">
            <label>Flight Date</label>
            <input 
              type="date" 
              [(ngModel)]="searchDate" 
              name="fdate" 
              class="custom-input"
            >
          </div>

          <button type="submit" [disabled]="loading" class="btn-primary track-btn">
            {{ loading ? 'Tracking...' : '🔍 Track Status' }}
          </button>
        </form>
      </div>

      <!-- Results Grid -->
      <div class="flights-results">
        <div *ngIf="loading" class="loading-state text-center">
          <p>Fetching real-time satellite radar flight data...</p>
        </div>

        <div *ngIf="!loading && flights.length === 0" class="empty-state glass-card text-center">
          <span class="empty-icon">🛫</span>
          <h3>No Flights Found</h3>
          <p>No operational flights match your criteria. Try searching with a different flight number or date.</p>
        </div>

        <div *ngFor="let f of flights" class="glass-card flight-card">
          <!-- Card Header -->
          <div class="card-top">
            <div class="airline-info">
              <img [src]="f.airline?.logo" [alt]="f.airline?.name" class="airline-logo">
              <div>
                <span class="airline-name">{{ f.airline?.name }}</span>
                <span class="flight-badge">{{ f.flightNumber }}</span>
              </div>
            </div>

            <div class="status-pill" [ngClass]="getStatusClass(f.status)">
              <span class="status-dot"></span>
              <span>{{ f.status | uppercase }}</span>
            </div>
          </div>

          <!-- Route & Times Timeline -->
          <div class="timeline-row">
            <div class="loc-col">
              <span class="time-large">{{ f.departureTime }}</span>
              <span class="loc-code">{{ f.departureAirport?.code }}</span>
              <span class="loc-city">{{ f.departureAirport?.city }}</span>
              <span class="terminal-tag">Terminal {{ f.departureAirport?.terminal || 'T2' }}</span>
            </div>

            <div class="flight-path">
              <span class="duration-tag">{{ f.duration }}</span>
              <div class="path-line">
                <span class="plane-icon">✈️</span>
              </div>
              <span class="stops-tag">{{ f.stops === 0 ? 'Direct Non-stop' : f.stops + ' Stop' }}</span>
            </div>

            <div class="loc-col text-right">
              <span class="time-large">{{ f.arrivalTime }}</span>
              <span class="loc-code">{{ f.arrivalAirport?.code }}</span>
              <span class="loc-city">{{ f.arrivalAirport?.city }}</span>
              <span class="terminal-tag">Terminal {{ f.arrivalAirport?.terminal || 'T1' }}</span>
            </div>
          </div>

          <!-- Card Footer Metadata -->
          <div class="card-footer">
            <div class="meta-item">
              <span class="meta-label">Aircraft</span>
              <span class="meta-val">{{ f.aircraftType || 'Airbus A320neo' }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Date</span>
              <span class="meta-val">{{ f.departureDate | date:'mediumDate' }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Seats Left</span>
              <span class="meta-val" [class.low-seats]="f.availableSeats < 10">{{ f.availableSeats }} seats</span>
            </div>
            <a [routerLink]="['/booking']" [queryParams]="{ flightId: f._id }" class="btn-secondary btn-sm">
              Book Ticket ➔
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .status-page { padding-top: 40px; padding-bottom: 60px; max-width: 1000px; margin: 0 auto; }
    .status-header { margin-bottom: 30px; text-align: center; }
    .badge-tag { font-size: 0.75rem; letter-spacing: 2px; font-weight: 800; color: var(--primary); display: block; margin-bottom: 8px; }
    .status-header h1 { font-size: 2.2rem; font-weight: 800; margin-bottom: 10px; }
    .status-header p { color: var(--text-muted); font-size: 0.95rem; max-width: 650px; margin: 0 auto; }

    .search-card { padding: 24px; margin-bottom: 30px; }
    .search-form { display: flex; gap: 16px; align-items: flex-end; flex-wrap: wrap; }
    .flex-2 { flex: 2; min-width: 220px; }
    .flex-1 { flex: 1; min-width: 180px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label { font-size: 0.85rem; font-weight: 700; color: var(--text-muted); }
    .track-btn { height: 44px; padding: 0 24px; font-weight: 700; }

    .flights-results { display: flex; flex-direction: column; gap: 20px; }
    .empty-state { padding: 40px; }
    .empty-icon { font-size: 3rem; display: block; margin-bottom: 10px; }

    .flight-card { padding: 24px; transition: 0.2s; border: 1px solid var(--border-color); }
    .flight-card:hover { border-color: var(--primary); }

    .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 14px; }
    .airline-info { display: flex; align-items: center; gap: 12px; }
    .airline-logo { width: 38px; height: 38px; border-radius: 8px; object-fit: cover; }
    .airline-name { font-weight: 700; display: block; font-size: 0.95rem; }
    .flight-badge { font-size: 0.8rem; color: var(--primary); font-weight: 700; }

    .status-pill { display: flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; }
    
    .status-ontime { background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); .status-dot { background: #4ade80; } }
    .status-delayed { background: rgba(249, 115, 22, 0.15); color: #fb923c; border: 1px solid rgba(249, 115, 22, 0.3); .status-dot { background: #fb923c; } }
    .status-inflight { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); .status-dot { background: #38bdf8; } }
    .status-cancelled { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); .status-dot { background: #f87171; } }
    .status-scheduled { background: rgba(148, 163, 184, 0.15); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.3); .status-dot { background: #94a3b8; } }

    .timeline-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .loc-col { display: flex; flex-direction: column; }
    .time-large { font-size: 1.6rem; font-weight: 800; }
    .loc-code { font-size: 1.1rem; font-weight: 700; color: var(--primary); }
    .loc-city { font-size: 0.85rem; color: var(--text-muted); }
    .terminal-tag { font-size: 0.75rem; background: rgba(255, 255, 255, 0.05); padding: 2px 6px; border-radius: 4px; margin-top: 4px; display: inline-block; }

    .flight-path { display: flex; flex-direction: column; align-items: center; flex: 1; padding: 0 20px; }
    .duration-tag { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; margin-bottom: 4px; }
    .path-line { width: 100%; height: 2px; background: var(--border-color); position: relative; display: flex; justify-content: center; align-items: center; }
    .plane-icon { position: absolute; transform: translateY(-1px); font-size: 0.9rem; }
    .stops-tag { font-size: 0.75rem; color: var(--primary); font-weight: 600; margin-top: 4px; }

    .card-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 14px; flex-wrap: wrap; gap: 12px; }
    .meta-item { display: flex; flex-direction: column; }
    .meta-label { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; }
    .meta-val { font-size: 0.85rem; font-weight: 600; }
    .low-seats { color: #f87171; font-weight: bold; }
    .btn-sm { padding: 6px 14px; font-size: 0.8rem; }
  `]
})
export class FlightStatusComponent implements OnInit {
  private flightService = inject(FlightService);

  flightNumber = '';
  searchDate = '';
  flights: Flight[] = [];
  loading = false;

  ngOnInit() {
    this.onSearch();
  }

  onSearch() {
    this.loading = true;
    this.flightService.getLiveFlightStatus(this.flightNumber, this.searchDate).subscribe({
      next: (data) => {
        this.flights = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching live flights:', err);
        this.loading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'on-time': return 'status-ontime';
      case 'delayed': return 'status-delayed';
      case 'in-flight': return 'status-inflight';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-scheduled';
    }
  }
}
