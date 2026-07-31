import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Refund } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class RefundService {
  private apiUrl = 'http://localhost:5000/api/refunds';

  constructor(private http: HttpClient) {}

  getRefunds(): Observable<Refund[]> {
    return this.http.get<Refund[]>(this.apiUrl);
  }

  updateRefundStatus(id: string, status: string, adminComment?: string): Observable<Refund> {
    return this.http.patch<Refund>(`${this.apiUrl}/${id}/status`, { status, adminComment });
  }
}
