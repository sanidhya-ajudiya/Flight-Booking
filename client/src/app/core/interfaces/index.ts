export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin' | 'staff';
  phone?: string;
  nationality?: string;
  passportNumber?: string;
  avatar?: string;
  walletBalance?: number;
  token?: string;
  refreshToken?: string;
}

export interface Airport {
  _id: string;
  name: string;
  code: string;
  city: string;
  country: string;
  terminal?: string;
  latitude?: number;
  longitude?: number;
  image?: string;
}

export interface Airline {
  _id: string;
  name: string;
  code: string;
  logo: string;
  country: string;
  description?: string;
  contactEmail?: string;
  website?: string;
}

export interface Flight {
  _id: string;
  flightNumber: string;
  airline: Airline;
  departureAirport: Airport;
  arrivalAirport: Airport;
  departureDate: string;
  arrivalDate: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  aircraftType: string;
  economyPrice: number;
  businessPrice: number;
  firstClassPrice: number;
  totalSeats: number;
  availableSeats: number;
  occupiedSeats: string[];
  status: 'Scheduled' | 'Delayed' | 'On-Time' | 'In-Flight' | 'Completed' | 'Cancelled';
  image?: string;
}

export interface Passenger {
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  passportNumber?: string;
  nationality?: string;
  seatNumber: string;
  extraBaggageKg?: number;
}

export interface Booking {
  _id: string;
  pnr: string;
  user: User;
  flight: Flight;
  tripType: 'one-way' | 'round-trip' | 'multi-city';
  returnFlight?: Flight;
  cabinClass: 'economy' | 'business' | 'firstClass';
  passengers: Passenger[];
  baseFare: number;
  taxAmount: number;
  extraBaggageFee: number;
  discountAmount: number;
  couponCode?: string;
  totalAmount: number;
  status: 'Confirmed' | 'Cancelled' | 'Completed' | 'Refunded';
  paymentStatus: 'Paid' | 'Pending' | 'Failed' | 'Refunded';
  paymentId?: string;
  paymentMethod?: string;
  createdAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minBookingAmount: number;
  maxDiscount?: number;
  expiryDate: string;
  isActive: boolean;
}

export interface Refund {
  _id: string;
  booking: Booking;
  user: User;
  amount: number;
  reason: string;
  status: 'Requested' | 'Approved' | 'Rejected' | 'Processed';
  refundMethod: string;
  adminComment?: string;
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: 'Booking' | 'FlightDelay' | 'Cancellation' | 'Refund' | 'Offer' | 'System';
  isRead: boolean;
  createdAt: string;
}

export interface WalletTransaction {
  type: 'Credit' | 'Debit';
  amount: number;
  description: string;
  date: string;
}

export interface Wallet {
  _id: string;
  user: string;
  balance: number;
  transactions: WalletTransaction[];
}

export interface DashboardKPIs {
  totalFlights: number;
  activeFlights: number;
  todayFlights: number;
  totalBookings: number;
  cancelledBookings: number;
  revenue: number;
  customers: number;
  airportsCount: number;
  airlinesCount: number;
  refundRequests: number;
  couponsCount: number;
}
