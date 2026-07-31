import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Flight } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class FlightService {
  private apiUrl = 'http://localhost:5000/api/flights';

  constructor(private http: HttpClient) {}

  searchFlights(filters: any): Observable<Flight[]> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });
    return this.http.get<Flight[]>(`${this.apiUrl}/search`, { params });
  }

  getAllFlights(): Observable<Flight[]> {
    return this.http.get<Flight[]>(this.apiUrl);
  }

  getFlightById(id: string): Observable<Flight> {
    return this.http.get<Flight>(`${this.apiUrl}/${id}`);
  }

  addFlight(flightData: any): Observable<Flight> {
    return this.http.post<Flight>(this.apiUrl, flightData);
  }

  updateFlight(id: string, flightData: any): Observable<Flight> {
    return this.http.put<Flight>(`${this.apiUrl}/${id}`, flightData);
  }

  updateFlightStatus(id: string, status: string): Observable<Flight> {
    return this.http.patch<Flight>(`${this.apiUrl}/${id}/status`, { status });
  }

  deleteFlight(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
