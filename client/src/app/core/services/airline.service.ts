import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Airline } from '../interfaces';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AirlineService {
  private apiUrl = `${environment.apiUrl}/airlines`;

  constructor(private http: HttpClient) {}

  getAirlines(): Observable<Airline[]> {
    return this.http.get<Airline[]>(this.apiUrl);
  }

  addAirline(data: any): Observable<Airline> {
    return this.http.post<Airline>(this.apiUrl, data);
  }

  updateAirline(id: string, data: any): Observable<Airline> {
    return this.http.put<Airline>(`${this.apiUrl}/${id}`, data);
  }

  deleteAirline(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
