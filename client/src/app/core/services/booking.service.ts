import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking } from '../interfaces';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) {}

  createBooking(bookingData: any): Observable<Booking> {
    return this.http.post<Booking>(this.apiUrl, bookingData);
  }

  getMyBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/my-bookings`);
  }

  getAllBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.apiUrl);
  }

  getBookingById(id: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/${id}`);
  }

  cancelBooking(id: string, reason?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/cancel`, { reason });
  }

  downloadTicketPDF(bookingId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${bookingId}/pdf`, { responseType: 'blob' });
  }

  lookupBookingByPNR(pnr: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/lookup/${pnr.toUpperCase().trim()}`);
  }

  webCheckIn(pnr: string, passengerIndex: number = 0): Observable<any> {
    return this.http.post(`${this.apiUrl}/check-in`, { pnr, passengerIndex });
  }
}
