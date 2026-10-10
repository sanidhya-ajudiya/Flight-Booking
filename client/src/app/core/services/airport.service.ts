import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Airport } from '../interfaces';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AirportService {
  private apiUrl = `${environment.apiUrl}/airports`;

  constructor(private http: HttpClient) {}

  getAirports(): Observable<Airport[]> {
    return this.http.get<Airport[]>(this.apiUrl);
  }

  addAirport(data: any): Observable<Airport> {
    return this.http.post<Airport>(this.apiUrl, data);
  }

  updateAirport(id: string, data: any): Observable<Airport> {
    return this.http.put<Airport>(`${this.apiUrl}/${id}`, data);
  }

  deleteAirport(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
