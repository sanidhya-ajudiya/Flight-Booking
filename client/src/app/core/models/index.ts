// ============================================================
// Core Models
// ============================================================

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
  timezone: string;
  lat?: number;
  lng?: number;
}

export interface Airline {
  code: string;
  name: string;
  logo?: string;
  color?: string;
}

export interface FlightSegment {
  flightNumber: string;
  airline: Airline;
  origin: Airport;
  destination: Airport;
  departureTime: string;
  arrivalTime: string;
  duration: number; // minutes
  aircraft: string;
  stops: number;
  stopDetails?: StopDetail[];
  baggageAllowance: BaggageAllowance;
}

export interface StopDetail {
  airport: Airport;
  layoverDuration: number; // minutes
}

export interface BaggageAllowance {
  cabin: string;
  checkedIn: string;
  carryOn: string;
}

export interface FlightPrice {
  base: number;
  taxes: number;
  gst: number;
  total: number;
  currency: string;
  pricePerPassenger: number;
}

export interface Flight {
  id: string;
  segments: FlightSegment[];
  price: FlightPrice;
  cabinClass: CabinClass;
  seatsAvailable: number;
  refundable: boolean;
  fareType: string;
  amenities: string[];
  rating?: number;
  onTimePerformance?: number;
}

export type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';
export type TripType = 'one-way' | 'round-trip' | 'multi-city';
export type SortBy = 'price' | 'duration' | 'departure' | 'arrival' | 'stops';

export interface SearchParams {
  tripType: TripType;
  origin: Airport | null;
  destination: Airport | null;
  departureDate: Date | null;
  returnDate?: Date | null;
  passengers: PassengerCount;
  cabinClass: CabinClass;
  multiCity?: MultiCityLeg[];
}

export interface MultiCityLeg {
  origin: Airport | null;
  destination: Airport | null;
  date: Date | null;
}

export interface PassengerCount {
  adults: number;
  children: number;
  infants: number;
}

export interface FilterOptions {
  airlines: string[];
  stops: number[];
  priceRange: [number, number];
  departureTime: TimeRange;
  arrivalTime: TimeRange;
  duration?: number;
}

export interface TimeRange {
  from: number; // hours 0-24
  to: number;
}

export interface Seat {
  id: string;
  row: number;
  column: string;
  class: CabinClass;
  available: boolean;
  selected?: boolean;
  price?: number;
  type: 'window' | 'middle' | 'aisle';
  features?: string[];
}

export interface Passenger {
  id?: string;
  type: 'adult' | 'child' | 'infant';
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  nationality?: string;
  passportNumber?: string;
  passportExpiry?: string;
  email?: string;
  phone?: string;
  specialAssistance?: string;
  mealPreference?: string;
  seatId?: string;
}

export interface Booking {
  id: string;
  bookingRef: string;
  pnr: string;
  status: BookingStatus;
  flight: Flight;
  returnFlight?: Flight;
  passengers: Passenger[];
  totalPrice: FlightPrice;
  payment?: PaymentInfo;
  createdAt: string;
  contactEmail: string;
  contactPhone: string;
}

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';

export interface PaymentInfo {
  method: PaymentMethod;
  transactionId?: string;
  status: 'success' | 'failed' | 'pending';
  amount: number;
  paidAt?: string;
}

export type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'wallet';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: string;
  savedPassengers?: Passenger[];
  preferences?: UserPreferences;
}

export interface UserPreferences {
  language: string;
  currency: string;
  notifications: boolean;
  theme: 'light' | 'dark';
}

export interface Coupon {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  maxDiscount?: number;
  minAmount?: number;
  validUntil?: string;
}

export interface Destination {
  city: string;
  country: string;
  code: string;
  image: string;
  price: number;
  currency: string;
  rating: number;
  tags: string[];
}

export interface Testimonial {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  review: string;
  route: string;
  date: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}
