import { Injectable, signal, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { User } from '../models';
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'skywings_token';
  private readonly USER_KEY  = 'skywings_user';
  private readonly API_URL   = 'http://localhost:5000/api/auth';

  private http = inject(HttpClient);
  private router = inject(Router);
  private notify = inject(NotificationService);

  // Signals
  readonly currentUser  = signal<User | null>(this.loadUser());
  readonly isLoggedIn   = signal<boolean>(!!this.loadToken());
  readonly isLoading    = signal<boolean>(false);

  constructor() {}

  // ── Login ─────────────────────────────────────────────
  login(email: string, password: string): Observable<{ token: string; user: User }> {
    this.isLoading.set(true);
    return this.http.post<{ success: boolean; token: string; user: User }>(`${this.API_URL}/login`, { email, password }).pipe(
      tap({
        next: (res) => {
          this.saveSession(res.token, res.user);
          this.notify.success('Welcome back, ' + res.user.firstName + '! ✈️');
        },
        error: (err) => {
          this.notify.error(err.error?.message || 'Login failed. Please check credentials.');
        }
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  // ── Register ──────────────────────────────────────────
  register(data: Partial<User> & { password: string }): Observable<{ token: string; user: User }> {
    this.isLoading.set(true);
    return this.http.post<{ success: boolean; token: string; user: User }>(`${this.API_URL}/register`, data).pipe(
      tap({
        next: (res) => {
          this.saveSession(res.token, res.user);
          this.notify.success('Account created successfully! Welcome to SkyWings ✈️');
        },
        error: (err) => {
          this.notify.error(err.error?.message || 'Registration failed.');
        }
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  logout(): void {
    this.http.post(`${this.API_URL}/logout`, {}).subscribe({
      next: () => {},
      error: () => {}
    });
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    this.router.navigate(['/']);
    this.notify.info('You have been logged out.');
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }

  updateProfile(data: Partial<User>): void {
    this.isLoading.set(true);
    this.http.put<{ success: boolean; user: User }>(`${this.API_URL}/profile`, data).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (res) => {
        this.currentUser.set(res.user);
        localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
        this.notify.success('Profile updated successfully!');
      },
      error: (err) => {
        this.notify.error(err.error?.message || 'Failed to update profile');
      }
    });
  }

  private saveSession(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
    this.isLoggedIn.set(true);
  }

  private loadUser(): User | null {
    try {
      const saved = localStorage.getItem(this.USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  }

  private loadToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
