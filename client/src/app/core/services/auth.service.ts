import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User } from '../interfaces';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient) {
    const savedUser = localStorage.getItem('skywings_user');
    if (savedUser) {
      try {
        this.currentUser.set(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('skywings_user');
      }
    }
  }

  register(userData: any): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, userData).pipe(
      tap(user => this.setUserSession(user))
    );
  }

  login(credentials: any): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, credentials).pipe(
      tap(user => this.setUserSession(user))
    );
  }

  logout() {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
      next: () => this.clearUserSession(),
      error: () => this.clearUserSession()
    });
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap(user => {
        const current = this.currentUser();
        if (current) {
          const updated = { ...current, ...user };
          this.currentUser.set(updated);
          localStorage.setItem('skywings_user', JSON.stringify(updated));
        }
      })
    );
  }

  updateProfile(profileData: any): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/users/profile`, profileData).pipe(
      tap(updated => {
        const current = this.currentUser();
        if (current) {
          const newUser = { ...current, ...updated };
          this.currentUser.set(newUser);
          localStorage.setItem('skywings_user', JSON.stringify(newUser));
        }
      })
    );
  }

  getToken(): string | null {
    return this.currentUser()?.token || null;
  }

  isLoggedIn(): boolean {
    return !!this.currentUser()?.token;
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(data: { email: string; otp: string; newPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, data);
  }

  addWalletMoney(amount: number, paymentMethod: string = 'Card'): Observable<any> {
    return this.http.post(`${environment.apiUrl}/users/wallet/add-money`, { amount, paymentMethod }).pipe(
      tap((res: any) => {
        const current = this.currentUser();
        if (current && res.walletBalance !== undefined) {
          const updated = { ...current, walletBalance: res.walletBalance };
          this.currentUser.set(updated);
          localStorage.setItem('skywings_user', JSON.stringify(updated));
        }
      })
    );
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/users`);
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/users/${userId}`);
  }

  private setUserSession(user: User) {
    this.currentUser.set(user);
    localStorage.setItem('skywings_user', JSON.stringify(user));
  }

  clearUserSession() {
    this.currentUser.set(null);
    localStorage.removeItem('skywings_user');
  }
}
