import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AirportService } from '../../../core/services/airport.service';
import { Airport } from '../../../core/interfaces';

@Component({
  selector: 'app-admin-airports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-container">
      <div class="admin-header">
        <div>
          <h2>Manage Airports</h2>
          <p>Add and configure global airport codes and terminal locations</p>
        </div>
        <button (click)="showModal = true" class="btn-primary">+ Add New Airport</button>
      </div>

      <div class="glass-card table-card">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Airport Name</th>
              <th>City</th>
              <th>Country</th>
              <th>Terminal</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let ap of airports">
              <td><strong>{{ ap.code }}</strong></td>
              <td>{{ ap.name }}</td>
              <td>{{ ap.city }}</td>
              <td>{{ ap.country }}</td>
              <td>{{ ap.terminal }}</td>
              <td>
                <button (click)="deleteAirport(ap._id)" class="btn-danger-sm">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add Airport Modal -->
      <div class="modal-backdrop" *ngIf="showModal">
        <div class="modal-card glass-card">
          <h3>Add Airport Terminal</h3>
          <form (ngSubmit)="saveAirport()" class="modal-form">
            <div class="form-group">
              <label>Airport Code (IATA 3-Letter)</label>
              <input type="text" [(ngModel)]="code" name="c" required placeholder="BOM" class="custom-input uppercase">
            </div>

            <div class="form-group">
              <label>Airport Name</label>
              <input type="text" [(ngModel)]="name" name="n" required placeholder="Chhatrapati Shivaji Maharaj Airport" class="custom-input">
            </div>

            <div class="form-group">
              <label>City</label>
              <input type="text" [(ngModel)]="city" name="ct" required placeholder="Mumbai" class="custom-input">
            </div>

            <div class="form-group">
              <label>Country</label>
              <input type="text" [(ngModel)]="country" name="cn" required placeholder="India" class="custom-input">
            </div>

            <div class="form-group">
              <label>Terminal</label>
              <input type="text" [(ngModel)]="terminal" name="t" placeholder="T2" class="custom-input">
            </div>

            <div class="modal-actions">
              <button (click)="showModal = false" type="button" class="btn-secondary">Cancel</button>
              <button type="submit" class="btn-primary">Add Airport</button>
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

    .custom-input { height: 42px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-primary); padding: 0 10px; font-weight: 600; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 10px; }
  `]
})
export class AdminAirportsComponent implements OnInit {
  airportService = inject(AirportService);

  airports: Airport[] = [];
  showModal: boolean = false;

  code: string = '';
  name: string = '';
  city: string = '';
  country: string = '';
  terminal: string = 'T1';

  ngOnInit() {
    this.fetchAirports();
  }

  fetchAirports() {
    this.airportService.getAirports().subscribe({ next: data => this.airports = data });
  }

  saveAirport() {
    const payload = { code: this.code, name: this.name, city: this.city, country: this.country, terminal: this.terminal };
    this.airportService.addAirport(payload).subscribe({
      next: () => {
        this.showModal = false;
        this.fetchAirports();
      }
    });
  }

  deleteAirport(id: string) {
    if (confirm('Delete this airport?')) {
      this.airportService.deleteAirport(id).subscribe({ next: () => this.fetchAirports() });
    }
  }
}
