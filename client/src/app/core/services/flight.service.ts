import { Injectable, signal, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import {
  Flight, SearchParams, FilterOptions, Airline, Airport,
  FlightSegment, CabinClass, SortBy, Destination, Booking
} from '../models';

@Injectable({ providedIn: 'root' })
export class FlightService {
  private readonly API_URL = 'http://localhost:5000/api';
  private http = inject(HttpClient);

  // State signals
  readonly searchParams  = signal<SearchParams | null>(null);
  readonly searchResults = signal<Flight[]>([]);
  readonly isSearching   = signal<boolean>(false);
  readonly selectedFlight = signal<Flight | null>(null);
  readonly currentBooking = signal<Booking | null>(null);
  readonly searchHistory  = signal<SearchParams[]>(this.loadHistory());

  // ── Popular Airports ──────────────────────────────────────
  readonly airports: Airport[] = [
    { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', country: 'India', countryCode: 'IN', timezone: 'IST' },
    { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'New Delhi', country: 'India', countryCode: 'IN', timezone: 'IST' },
    { code: 'BLR', name: 'Kempegowda International Airport', city: 'Bengaluru', country: 'India', countryCode: 'IN', timezone: 'IST' },
    { code: 'MAA', name: 'Chennai International Airport', city: 'Chennai', country: 'India', countryCode: 'IN', timezone: 'IST' },
    { code: 'HYD', name: 'Rajiv Gandhi International Airport', city: 'Hyderabad', country: 'India', countryCode: 'IN', timezone: 'IST' },
    { code: 'CCU', name: 'Netaji Subhas Chandra Bose International Airport', city: 'Kolkata', country: 'India', countryCode: 'IN', timezone: 'IST' },
    { code: 'COK', name: 'Cochin International Airport', city: 'Kochi', country: 'India', countryCode: 'IN', timezone: 'IST' },
    { code: 'AMD', name: 'Sardar Vallabhbhai Patel International Airport', city: 'Ahmedabad', country: 'India', countryCode: 'IN', timezone: 'IST' },
    { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'UAE', countryCode: 'AE', timezone: 'GST' },
    { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', countryCode: 'SG', timezone: 'SGT' },
    { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'UK', countryCode: 'GB', timezone: 'GMT' },
    { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'USA', countryCode: 'US', timezone: 'EST' },
    { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', countryCode: 'FR', timezone: 'CET' },
    { code: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan', countryCode: 'JP', timezone: 'JST' },
    { code: 'DOH', name: 'Hamad International Airport', city: 'Doha', country: 'Qatar', countryCode: 'QA', timezone: 'AST' },
    { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', countryCode: 'TH', timezone: 'ICT' },
    { code: 'SYD', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia', countryCode: 'AU', timezone: 'AEST' },
    { code: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands', countryCode: 'NL', timezone: 'CET' },
  ];

  readonly airlines: Airline[] = [
    { code: 'AI', name: 'Air India', color: '#D32F2F' },
    { code: '6E', name: 'IndiGo', color: '#1565C0' },
    { code: 'SG', name: 'SpiceJet', color: '#FF6D00' },
    { code: 'UK', name: 'Vistara', color: '#6A1B9A' },
    { code: 'G8', name: 'Go First', color: '#00695C' },
    { code: 'EK', name: 'Emirates', color: '#B71C1C' },
    { code: 'QR', name: 'Qatar Airways', color: '#6A1B9A' },
    { code: 'SQ', name: 'Singapore Airlines', color: '#F57F17' },
    { code: 'BA', name: 'British Airways', color: '#0D47A1' },
  ];

  readonly popularDestinations: Destination[] = [
    { city: 'Dubai', country: 'UAE', code: 'DXB', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400', price: 18500, currency: 'INR', rating: 4.8, tags: ['popular', 'luxury'] },
    { city: 'Singapore', country: 'Singapore', code: 'SIN', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400', price: 22000, currency: 'INR', rating: 4.9, tags: ['popular', 'family'] },
    { city: 'Bangkok', country: 'Thailand', code: 'BKK', image: 'https://images.unsplash.com/photo-1508009603885-50cf7c8dd0d5?w=400', price: 15000, currency: 'INR', rating: 4.7, tags: ['budget', 'culture'] },
    { city: 'London', country: 'UK', code: 'LHR', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400', price: 55000, currency: 'INR', rating: 4.8, tags: ['popular', 'culture'] },
    { city: 'Paris', country: 'France', code: 'CDG', image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400', price: 48000, currency: 'INR', rating: 4.9, tags: ['romantic', 'luxury'] },
    { city: 'Tokyo', country: 'Japan', code: 'NRT', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400', price: 42000, currency: 'INR', rating: 4.9, tags: ['popular', 'culture'] },
  ];

  // ── Search ─────────────────────────────────────────────────
  searchFlights(params: SearchParams): Observable<Flight[]> {
    this.isSearching.set(true);
    this.searchParams.set(params);
    this.saveHistory(params);

    const queryParams: any = {
      origin: params.origin?.code,
      destination: params.destination?.code,
      cabinClass: params.cabinClass
    };

    if (params.departureDate) {
      // Format as YYYY-MM-DD
      const d = new Date(params.departureDate);
      queryParams.departureDate = d.toISOString().split('T')[0];
    }

    return this.http.get<{ success: boolean; data: Flight[] }>(`${this.API_URL}/flights/search`, { params: queryParams }).pipe(
      map(res => res.data),
      tap(flights => {
        this.searchResults.set(flights);
        this.isSearching.set(false);
      })
    );
  }

  getFlightById(id: string): Flight | undefined {
    return this.searchResults().find(f => f.id === id);
  }

  searchAirports(query: string): Airport[] {
    const q = query.toLowerCase();
    return this.airports.filter(a =>
      a.code.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.country.toLowerCase().includes(q)
    ).slice(0, 8);
  }

  sortFlights(flights: Flight[], by: SortBy): Flight[] {
    return [...flights].sort((a, b) => {
      switch (by) {
        case 'price':     return a.price.total - b.price.total;
        case 'duration':  return a.segments[0].duration - b.segments[0].duration;
        case 'departure': return new Date(a.segments[0].departureTime).getTime() - new Date(b.segments[0].departureTime).getTime();
        case 'arrival':   return new Date(a.segments[0].arrivalTime).getTime() - new Date(b.segments[0].arrivalTime).getTime();
        case 'stops':     return a.segments[0].stops - b.segments[0].stops;
        default:          return 0;
      }
    });
  }

  filterFlights(flights: Flight[], filters: FilterOptions): Flight[] {
    return flights.filter(f => {
      const seg = f.segments[0];
      const depHour = new Date(seg.departureTime).getHours();
      const arrHour = new Date(seg.arrivalTime).getHours();
      const price   = f.price.total;

      if (filters.airlines.length > 0 && !filters.airlines.includes(seg.airline.code)) return false;
      if (filters.stops.length > 0 && !filters.stops.includes(seg.stops)) return false;
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) return false;
      if (depHour < filters.departureTime.from || depHour > filters.departureTime.to) return false;
      if (arrHour < filters.arrivalTime.from || arrHour > filters.arrivalTime.to) return false;
      return true;
    });
  }

  // ── Booking ────────────────────────────────────────────────
  createBooking(booking: Partial<Booking>): Observable<Booking> {
    const body = {
      flightId: booking.flight?.id,
      passengers: booking.passengers,
      contactEmail: booking.contactEmail,
      contactPhone: booking.contactPhone,
      cabinClass: booking.flight?.cabinClass || 'economy',
      discount: (booking as any).discount || 0
    };

    return this.http.post<{ success: boolean; data: Booking }>(`${this.API_URL}/bookings`, body).pipe(
      map(res => res.data),
      tap(newBooking => {
        this.currentBooking.set(newBooking);
        this.saveBooking(newBooking);
      })
    );
  }

  getMyBookings(): Observable<Booking[]> {
    return this.http.get<{ success: boolean; count: number; data: Booking[] }>(`${this.API_URL}/bookings/my-bookings`).pipe(
      map(res => res.data),
      tap(list => {
        localStorage.setItem('skywings_bookings', JSON.stringify(list));
      })
    );
  }

  private saveBooking(booking: Booking): void {
    try {
      const existing: Booking[] = JSON.parse(localStorage.getItem('skywings_bookings') || '[]');
      existing.unshift(booking);
      localStorage.setItem('skywings_bookings', JSON.stringify(existing));
    } catch {}
  }

  private saveHistory(params: SearchParams): void {
    const history = this.searchHistory();
    const updated = [params, ...history.slice(0, 4)];
    this.searchHistory.set(updated);
    localStorage.setItem('skywings_search_history', JSON.stringify(updated));
  }

  private loadHistory(): SearchParams[] {
    try {
      const saved = localStorage.getItem('skywings_search_history');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  }
}
