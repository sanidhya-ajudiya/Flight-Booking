import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Coupon } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  private apiUrl = 'http://localhost:5000/api/coupons';

  constructor(private http: HttpClient) {}

  validateCoupon(code: string, bookingAmount: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/validate`, { code, bookingAmount });
  }

  getCoupons(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(this.apiUrl);
  }

  addCoupon(data: any): Observable<Coupon> {
    return this.http.post<Coupon>(this.apiUrl, data);
  }

  deleteCoupon(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
