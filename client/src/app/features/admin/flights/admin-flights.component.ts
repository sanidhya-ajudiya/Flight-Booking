import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlightService } from '../../../core/services/flight.service';
import { AirportService } from '../../../core/services/airport.service';
import { AirlineService } from '../../../core/services/airline.service';
import { Flight, Airport, Airline } from '../../../core/interfaces';

@Component({
  selector: 'app-admin-flights',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-container">
      <div class="admin-header">
        <div>
          <h2>Manage System Flights</h2>
          <p>Create, schedule, update status, and manage seating capacity</p>
        </div>
        <button (click)="openAddModal()" class="btn-primary">+ Add New Flight</button>
      </div>

      <div class="glass-card table-card">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Flight No</th>
              <th>Airline</th>
              <th>Route</th>
              <th>Schedule</th>
              <th>Fares (Eco / Biz)</th>
              <th>Seats</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let f of flights">
              <td><strong>{{ f.flightNumber }}</strong></td>
              <td>{{ f.airline.name }}</td>
              <td>{{ f.departureAirport.code }} ➔ {{ f.arrivalAirport.code }}</td>
              <td>{{ f.departureTime }} - {{ f.arrivalTime }} ({{ f.duration }})</td>
              <td>₹{{ f.economyPrice }} / ₹{{ f.businessPrice }}</td>
              <td>{{ f.availableSeats }} / {{ f.totalSeats }}</td>
              <td>
                <select [(ngModel)]="f.status" (change)="updateStatus(f)" class="status-select">
                  <option value="Scheduled">Scheduled</option>
                  <option value="On-Time">On-Time</option>
                  <option value="Delayed">Delayed</option>
                  <option value="In-Flight">In-Flight</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </td>
              <td>
                <button (click)="deleteFlight(f._id)" class="btn-danger-sm">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add Flight Modal Dialog -->
      <div class="modal-backdrop" *ngIf="showModal">
        <div class="modal-card glass-card">
          <h3>Create New Flight Schedule</h3>
          <form (ngSubmit)="saveFlight()" class="modal-form">
            <div class="form-grid">
              <div class="form-group">
                <label>Flight Number</label>
                <input type="text" [(ngModel)]="formFlightNumber" name="fn" required placeholder="SK-101" class="custom-input">
              </div>

              <div class="form-group">
                <label>Airline</label>
                <select [(ngModel)]="formAirline" name="al" required class="custom-select">
                  <option *ngFor="let a of airlines" [value]="a._id">{{ a.name }}</option>
                </select>
              </div>

              <div class="form-group">
                <label>Departure Airport</label>
                <select [(ngModel)]="formDep" name="dep" required class="custom-select">
                  <option *ngFor="let ap of airports" [value]="ap._id">{{ ap.city }} ({{ ap.code }})</option>
                </select>
              </div>

              <div class="form-group">
                <label>Arrival Airport</label>
                <select [(ngModel)]="formArr" name="arr" required class="custom-select">
                  <option *ngFor="let ap of airports" [value]="ap._id">{{ ap.city }} ({{ ap.code }})</option>
                </select>
              </div>

              <div class="form-group">
                <label>Departure Date</label>
                <input type="date" [(ngModel)]="formDepDate" name="dd" required class="custom-input">
              </div>

              <div class="form-group">
                <label>Arrival Date</label>
                <input type="date" [(ngModel)]="formArrDate" name="ad" required class="custom-input">
              </div>

              <div class="form-group">
                <label>Dep Time (e.g. 08:00)</label>
                <input type="text" [(ngModel)]="formDepTime" name="dt" required class="custom-input">
              </div>

              <div class="form-group">
                <label>Arr Time (e.g. 10:15)</label>
                <input type="text" [(ngModel)]="formArrTime" name="at" required class="custom-input">
              </div>

              <div class="form-group">
                <label>Duration (e.g. 2h 15m)</label>
                <input type="text" [(ngModel)]="formDuration" name="dur" required class="custom-input">
              </div>

              <div class="form-group">
                <label>Economy Fare (₹)</label>
                <input type="number" [(ngModel)]="formEcoPrice" name="ep" required class="custom-input">
              </div>

              <div class="form-group">
                <label>Business Fare (₹)</label>
                <input type="number" [(ngModel)]="formBizPrice" name="bp" required class="custom-input">
              </div>

              <div class="form-group">
                <label>First Class Fare (₹)</label>
                <input type="number" [(ngModel)]="formFirstPrice" name="fp" required class="custom-input">
              </div>
            </div>

            <div class="modal-actions">
              <button (click)="showModal = false" type="button" class="btn-secondary">Cancel</button>
              <button type="submit" class="btn-primary">Save Flight</button>
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

    .status-select {
      height: 32px; border-radius: 6px; border: 1px solid var(--border-color);
      background: var(--bg-primary); color: var(--text-primary); font-weight: 700; padding: 0 8px;
    }

    .btn-danger-sm {
      background: #ef4444; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 700; cursor: pointer;
    }

    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 2000;
      display: flex; justify-content: center; align-items: center; padding: 20px;
    }

    .modal-card { width: 100%; max-width: 650px; padding: 32px; }
    .modal-card h3 { font-size: 1.4rem; font-weight: 800; margin-bottom: 20px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .form-group { display: flex; flex-direction: column; gap: 4px; label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); } }

    .custom-input, .custom-select {
      height: 40px; border-radius: 8px; border: 1px solid var(--border-color);
      background: var(--bg-primary); color: var(--text-primary); padding: 0 10px; font-weight: 600;
    }

    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
  `]
})
export class AdminFlightsComponent implements OnInit {
  flightService = inject(FlightService);
  airportService = inject(AirportService);
  airlineService = inject(AirlineService);

  flights: Flight[] = [];
  airports: Airport[] = [];
  airlines: Airline[] = [];

  showModal: boolean = false;
  formFlightNumber: string = '';
  formAirline: string = '';
  formDep: string = '';
  formArr: string = '';
  formDepDate: string = new Date().toISOString().split('T')[0];
  formArrDate: string = new Date().toISOString().split('T')[0];
  formDepTime: string = '09:00';
  formArrTime: string = '11:15';
  formDuration: string = '2h 15m';
  formEcoPrice: number = 4500;
  formBizPrice: number = 12000;
  formFirstPrice: number = 24000;

  ngOnInit() {
    this.fetchFlights();
    this.airportService.getAirports().subscribe({ next: data => this.airports = data });
    this.airlineService.getAirlines().subscribe({ next: data => this.airlines = data });
  }

  fetchFlights() {
    this.flightService.getAllFlights().subscribe({ next: data => this.flights = data });
  }

  openAddModal() {
    if (this.airlines.length > 0) this.formAirline = this.airlines[0]._id;
    if (this.airports.length > 1) {
      this.formDep = this.airports[0]._id;
      this.formArr = this.airports[1]._id;
    }
    this.showModal = true;
  }

  saveFlight() {
    const payload = {
      flightNumber: this.formFlightNumber,
      airline: this.formAirline,
      departureAirport: this.formDep,
      arrivalAirport: this.formArr,
      departureDate: this.formDepDate,
      arrivalDate: this.formArrDate,
      departureTime: this.formDepTime,
      arrivalTime: this.formArrTime,
      duration: this.formDuration,
      economyPrice: this.formEcoPrice,
      businessPrice: this.formBizPrice,
      firstClassPrice: this.formFirstPrice
    };

    this.flightService.addFlight(payload).subscribe({
      next: () => {
        this.showModal = false;
        this.fetchFlights();
      },
      error: err => alert(err.error?.message || 'Failed to create flight')
    });
  }

  updateStatus(flight: Flight) {
    this.flightService.updateFlightStatus(flight._id, flight.status).subscribe({
      next: () => alert(`Flight ${flight.flightNumber} status updated to ${flight.status}`)
    });
  }

  deleteFlight(id: string) {
    if (confirm('Are you sure you want to delete this flight?')) {
      this.flightService.deleteFlight(id).subscribe({ next: () => this.fetchFlights() });
    }
  }
}
