import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AirlineService } from '../../../core/services/airline.service';
import { Airline } from '../../../core/interfaces';

@Component({
  selector: 'app-admin-airlines',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-container">
      <div class="admin-header">
        <div>
          <h2>Manage Airlines</h2>
          <p>Register partner airline logos, codes, and contact details</p>
        </div>
        <button (click)="showModal = true" class="btn-primary">+ Add New Airline</button>
      </div>

      <div class="glass-card table-card">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Logo</th>
              <th>Airline Name</th>
              <th>Code</th>
              <th>Country</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let al of airlines">
              <td><img [src]="al.logo" class="logo-img"></td>
              <td><strong>{{ al.name }}</strong></td>
              <td>{{ al.code }}</td>
              <td>{{ al.country }}</td>
              <td>
                <button (click)="deleteAirline(al._id)" class="btn-danger-sm">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add Airline Modal -->
      <div class="modal-backdrop" *ngIf="showModal">
        <div class="modal-card glass-card">
          <h3>Register Partner Airline</h3>
          <form (ngSubmit)="saveAirline()" class="modal-form">
            <div class="form-group">
              <label>Airline Code (e.g. EK, AI)</label>
              <input type="text" [(ngModel)]="code" name="c" required class="custom-input uppercase">
            </div>

            <div class="form-group">
              <label>Airline Name</label>
              <input type="text" [(ngModel)]="name" name="n" required placeholder="Emirates" class="custom-input">
            </div>

            <div class="form-group">
              <label>Logo Image URL</label>
              <input type="text" [(ngModel)]="logo" name="l" required class="custom-input">
            </div>

            <div class="form-group">
              <label>Country</label>
              <input type="text" [(ngModel)]="country" name="cn" required placeholder="UAE" class="custom-input">
            </div>

            <div class="modal-actions">
              <button (click)="showModal = false" type="button" class="btn-secondary">Cancel</button>
              <button type="submit" class="btn-primary">Add Airline</button>
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

    .logo-img { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; }
    .btn-danger-sm { background: #ef4444; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 700; cursor: pointer; }

    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 2000; display: flex; justify-content: center; align-items: center; }
    .modal-card { width: 100%; max-width: 450px; padding: 32px; }
    .modal-form { display: flex; flex-direction: column; gap: 14px; margin-top: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 4px; label { font-size: 0.78rem; font-weight: 700; color: var(--text-muted); } }

    .custom-input { height: 42px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-primary); padding: 0 10px; font-weight: 600; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 10px; }
  `]
})
export class AdminAirlinesComponent implements OnInit {
  airlineService = inject(AirlineService);

  airlines: Airline[] = [];
  showModal: boolean = false;

  code: string = '';
  name: string = '';
  logo: string = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=200';
  country: string = '';

  ngOnInit() {
    this.fetchAirlines();
  }

  fetchAirlines() {
    this.airlineService.getAirlines().subscribe({ next: data => this.airlines = data });
  }

  saveAirline() {
    const payload = { code: this.code, name: this.name, logo: this.logo, country: this.country };
    this.airlineService.addAirline(payload).subscribe({
      next: () => {
        this.showModal = false;
        this.fetchAirlines();
      }
    });
  }

  deleteAirline(id: string) {
    if (confirm('Delete this airline?')) {
      this.airlineService.deleteAirline(id).subscribe({ next: () => this.fetchAirlines() });
    }
  }
}
