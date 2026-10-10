import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/interfaces';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="admin-container">
      <div class="admin-header">
        <div>
          <h2>User Accounts Management</h2>
          <p>Oversee registered passengers, staff accounts, and user balances</p>
        </div>
        <div class="user-stats">
          <span class="stat-pill">Total Users: <strong>{{ users.length }}</strong></span>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="filters-bar glass-card">
        <input 
          type="text" 
          [(ngModel)]="searchQuery" 
          placeholder="Search by name, email, or phone..." 
          class="custom-input search-input"
        >
      </div>

      <!-- Users Table -->
      <div class="glass-card table-card">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Passenger / User</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Nationality</th>
              <th>Wallet Balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of filteredUsers()">
              <td>
                <div class="user-cell">
                  <img [src]="u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'" class="avatar-sm" alt="Avatar">
                  <div>
                    <strong>{{ u.name }}</strong>
                    <div class="passport-text">{{ u.passportNumber ? 'Passport: ' + u.passportNumber : 'No Passport' }}</div>
                  </div>
                </div>
              </td>
              <td>{{ u.email }}</td>
              <td>{{ u.phone || 'N/A' }}</td>
              <td>
                <span class="badge" [ngClass]="u.role === 'admin' ? 'badge-admin' : 'badge-customer'">
                  {{ u.role | uppercase }}
                </span>
              </td>
              <td>{{ u.nationality || 'Indian' }}</td>
              <td><strong>₹{{ u.walletBalance || 0 }}</strong></td>
              <td>
                <button 
                  *ngIf="u.role !== 'admin'" 
                  (click)="onDeleteUser(u._id, u.name)" 
                  class="btn-danger-sm"
                  title="Delete user account"
                >
                  Delete
                </button>
                <span *ngIf="u.role === 'admin'" class="protected-badge">Protected</span>
              </td>
            </tr>
            <tr *ngIf="filteredUsers().length === 0">
              <td colspan="7" class="empty-state">No matching users found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .admin-container { padding: 40px 24px; max-width: 1300px; margin: 0 auto; }
    .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .admin-header h2 { font-size: 1.8rem; font-weight: 800; margin: 0 0 6px 0; }
    .admin-header p { color: var(--text-muted); margin: 0; }
    
    .stat-pill { background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; padding: 6px 16px; border-radius: 20px; font-size: 0.9rem; }
    .filters-bar { padding: 16px; margin-bottom: 20px; }
    .search-input { width: 100%; max-width: 400px; }

    .table-card { overflow-x: auto; padding: 0; }
    .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
    .admin-table th { background: var(--bg-primary); padding: 14px 18px; font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; border-bottom: 1px solid var(--border-color); }
    .admin-table td { padding: 14px 18px; border-bottom: 1px solid var(--border-color); font-size: 0.9rem; }
    .admin-table tr:hover td { background: rgba(255, 255, 255, 0.02); }

    .user-cell { display: flex; align-items: center; gap: 12px; }
    .avatar-sm { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; }
    .passport-text { font-size: 0.75rem; color: var(--text-muted); }

    .badge { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; }
    .badge-admin { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
    .badge-customer { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }

    .btn-danger-sm { background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: 600; transition: 0.2s; }
    .btn-danger-sm:hover { background: #ef4444; color: #fff; }
    .protected-badge { font-size: 0.75rem; color: var(--text-muted); font-style: italic; }
    .empty-state { text-align: center; padding: 30px; color: var(--text-muted); }
  `]
})
export class AdminUsersComponent implements OnInit {
  private authService = inject(AuthService);

  users: User[] = [];
  searchQuery = '';
  loading = false;

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.loading = true;
    this.authService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load users:', err);
        this.loading = false;
      }
    });
  }

  filteredUsers(): User[] {
    if (!this.searchQuery) return this.users;
    const q = this.searchQuery.toLowerCase();
    return this.users.filter(u => 
      u.name.toLowerCase().includes(q) || 
      u.email.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q))
    );
  }

  onDeleteUser(userId: string, name: string) {
    if (confirm(`Are you sure you want to delete user "${name}"?`)) {
      this.authService.deleteUser(userId).subscribe({
        next: () => {
          this.users = this.users.filter(u => u._id !== userId);
          alert('User deleted successfully');
        },
        error: (err) => alert(err.error?.message || 'Delete failed')
      });
    }
  }
}
