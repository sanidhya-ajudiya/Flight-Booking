import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, of, delay } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../models';
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'skywings_token';
  private readonly USER_KEY  = 'skywings_user';

  // Signals
  readonly currentUser  = signal<User | null>(this.loadUser());
  readonly isLoggedIn   = signal<boolean>(!!this.loadToken());
  readonly isLoading    = signal<boolean>(false);

  constructor(
    private router: Router,
    private notify: NotificationService
  ) {}

  // ── Mock Login ─────────────────────────────────────────────
  login(email: string, password: string): Observable<{ token: string; user: User }> {
    this.isLoading.set(true);
    const mockUser: User = {
      id: '1',
      email,
      firstName: 'Arjun',
      lastName: 'Sharma',
      phone: '+91 98765 43210',
      role: email.includes('admin') ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
      preferences: { language: 'en', currency: 'INR', notifications: true, theme: 'light' }
    };

    return of({ token: 'mock-jwt-token-' + Date.now(), user: mockUser }).pipe(
      delay(1200),
      tap(({ token, user }) => {
        this.saveSession(token, user);
        this.isLoading.set(false);
        this.notify.success('Welcome back, ' + user.firstName + '! ✈️');
      })
    );
  }

  // ── Mock Register ──────────────────────────────────────────
  register(data: Partial<User> & { password: string }): Observable<{ token: string; user: User }> {
    this.isLoading.set(true);
    const newUser: User = {
      id: Date.now().toString(),
      email: data.email!,
      firstName: data.firstName!,
      lastName: data.lastName!,
      phone: data.phone,
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    return of({ token: 'mock-jwt-token-' + Date.now(), user: newUser }).pipe(
      delay(1500),
      tap(({ token, user }) => {
        this.saveSession(token, user);
        this.isLoading.set(false);
        this.notify.success('Account created successfully! Welcome to SkyWings ✈️');
      })
    );
  }

  logout(): void {
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
    const user = this.currentUser();
    if (user) {
      const updated = { ...user, ...data };
      this.currentUser.set(updated);
      localStorage.setItem(this.USER_KEY, JSON.stringify(updated));
      this.notify.success('Profile updated successfully!');
    }
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
