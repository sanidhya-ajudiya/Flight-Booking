const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: `${__dirname}/../.env` });

// Load models
const User = require('../models/User');
const Airport = require('../models/Airport');
const Airline = require('../models/Airline');
const Flight = require('../models/Flight');
const Booking = require('../models/Booking');
const Coupon = require('../models/Coupon');
const Wishlist = require('../models/Wishlist');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const Review = require('../models/Review');

// Connect to DB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/flight-booking');

// Mock Data
const airportsData = [
  { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', country: 'India', countryCode: 'IN', timezone: 'IST', lat: 19.0896, lng: 72.8656, terminal: ['T1', 'T2'], status: 'active' },
  { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'New Delhi', country: 'India', countryCode: 'IN', timezone: 'IST', lat: 28.5562, lng: 77.1000, terminal: ['T1', 'T2', 'T3'], status: 'active' },
  { code: 'BLR', name: 'Kempegowda International Airport', city: 'Bengaluru', country: 'India', countryCode: 'IN', timezone: 'IST', lat: 13.1986, lng: 77.7068, terminal: ['T1', 'T2'], status: 'active' },
  { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'UAE', countryCode: 'AE', timezone: 'GST', lat: 25.2532, lng: 55.3657, terminal: ['T1', 'T2', 'T3'], status: 'active' },
  { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', countryCode: 'SG', timezone: 'SGT', lat: 1.3644, lng: 103.9915, terminal: ['T1', 'T2', 'T3', 'T4'], status: 'active' },
  { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'UK', countryCode: 'GB', timezone: 'GMT', lat: 51.4700, lng: -0.4543, terminal: ['T2', 'T3', 'T4', 'T5'], status: 'active' }
];

const airlinesData = [
  { code: 'AI', name: 'Air India', logo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=80,h=80', country: 'India', color: '#D32F2F', status: 'active' },
  { code: '6E', name: 'IndiGo', logo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=80,h=80', country: 'India', color: '#1565C0', status: 'active' },
  { code: 'SG', name: 'SpiceJet', logo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=80,h=80', country: 'India', color: '#FF6D00', status: 'active' },
  { code: 'UK', name: 'Vistara', logo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=80,h=80', country: 'India', color: '#6A1B9A', status: 'active' },
  { code: 'EK', name: 'Emirates', logo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=80,h=80', country: 'UAE', color: '#B71C1C', status: 'active' }
];

const couponsData = [
  { code: 'EUROPE20', discount: 20, type: 'percentage', validUntil: new Date('2028-12-31'), minAmount: 10000, status: 'active' },
  { code: 'SAVE1000', discount: 1000, type: 'fixed', validUntil: new Date('2028-12-31'), minAmount: 5000, status: 'active' },
  { code: 'SKYWINGS', discount: 500, type: 'fixed', validUntil: new Date('2028-12-31'), minAmount: 3000, status: 'active' }
];

// Import into DB
const importData = async () => {
  try {
    console.log('Clearing database...');
    await User.deleteMany();
    await Airport.deleteMany();
    await Airline.deleteMany();
    await Flight.deleteMany();
    await Booking.deleteMany();
    await Coupon.deleteMany();
    await Wishlist.deleteMany();
    await Payment.deleteMany();
    await Notification.deleteMany();
    await Review.deleteMany();

    console.log('Seeding Users...');
    // Create Default User & Admin
    const user = await User.create({
      firstName: 'Arjun',
      lastName: 'Sharma',
      email: 'user@example.com',
      password: 'password',
      phone: '+91 98765 43210',
      role: 'user',
      isVerified: true
    });

    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'System',
      email: 'admin@example.com',
      password: 'password',
      phone: '+91 99999 99999',
      role: 'admin',
      isVerified: true
    });

    console.log('Seeding Airports & Airlines...');
    const createdAirports = await Airport.insertMany(airportsData);
    const createdAirlines = await Airline.insertMany(airlinesData);
    await Coupon.insertMany(couponsData);

    console.log('Seeding Flights...');
    const flights = [];
    const dateOffsets = [0, 1, 2, 3, 4, 5, 6, 7]; // relative days

    // Helper to generate flight hours
    const hours = [6, 8, 10, 12, 14, 16, 18, 21];

    dateOffsets.forEach(offset => {
      createdAirports.forEach(origin => {
        createdAirports.forEach(destination => {
          if (origin.code === destination.code) return; // no self flight

          // Select some random airline
          const airline = createdAirlines[Math.floor(Math.random() * createdAirlines.length)];

          hours.forEach((hour, idx) => {
            // limit flights density
            if ((idx + origin.code.charCodeAt(0) + destination.code.charCodeAt(0)) % 4 !== 0) return;

            const departure = new Date();
            departure.setDate(departure.getDate() + offset);
            departure.setHours(hour, Math.floor(Math.random() * 6), 0, 0);

            const duration = 120 + Math.floor(Math.random() * 240); // 2 to 6 hours
            const arrival = new Date(departure.getTime() + duration * 60000);

            const baseEco = 3500 + Math.floor(Math.random() * 3000);

            flights.push({
              flightNumber: `${airline.code}${300 + idx * 24 + offset * 7}`,
              airline: airline._id,
              origin: origin._id,
              destination: destination._id,
              departureTime: departure,
              arrivalTime: arrival,
              duration,
              aircraft: ['Boeing 737', 'Airbus A320', 'Boeing 787', 'Airbus A350'][idx % 4],
              stops: idx % 3 === 0 ? 1 : 0,
              stopDetails: idx % 3 === 0 ? [{
                airport: createdAirports[(idx + 1) % createdAirports.length]._id,
                layoverDuration: 45
              }] : [],
              baggageAllowance: {
                cabin: '7 kg',
                checkedIn: idx % 3 === 0 ? '23 kg' : '15 kg',
                carryOn: '1 piece'
              },
              prices: {
                economy: baseEco,
                premium_economy: Math.round(baseEco * 1.3),
                business: Math.round(baseEco * 2.5),
                first: Math.round(baseEco * 4.0)
              },
              seats: {
                economy: 120,
                premium_economy: 20,
                business: 20,
                first: 10
              },
              seatsBooked: {
                economy: [],
                premium_economy: [],
                business: [],
                first: []
              },
              refundable: idx % 2 === 0,
              fareType: idx % 3 === 0 ? 'Saver' : 'Flexi',
              amenities: ['Wi-Fi', 'Meal', 'Entertainment'].slice(0, (idx % 3) + 1),
              rating: (4.0 + Math.random() * 1.0).toFixed(1),
              onTimePerformance: 75 + Math.floor(Math.random() * 20),
              status: 'scheduled'
            });
          });
        });
      });
    });

    await Flight.insertMany(flights);

    console.log(`Successfully seeded:`);
    console.log(`- Users: ${await User.countDocuments()}`);
    console.log(`- Airports: ${createdAirports.length}`);
    console.log(`- Airlines: ${createdAirlines.length}`);
    console.log(`- Coupons: ${couponsData.length}`);
    console.log(`- Flights: ${flights.length}`);

    console.log('Database Seeding Completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error importing seed data:', error);
    process.exit(1);
  }
};

importData();
