const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Airport = require('./models/Airport');
const Airline = require('./models/Airline');
const Flight = require('./models/Flight');
const Coupon = require('./models/Coupon');
const Wallet = require('./models/Wallet');

dotenv.config();

const airportsData = [
  { name: 'Chhatrapati Shivaji Maharaj International Airport', code: 'BOM', city: 'Mumbai', country: 'India', terminal: 'T2', latitude: 19.0896, longitude: 72.8656 },
  { name: 'Indira Gandhi International Airport', code: 'DEL', city: 'Delhi', country: 'India', terminal: 'T3', latitude: 28.5562, longitude: 77.1000 },
  { name: 'Kempegowda International Airport', code: 'BLR', city: 'Bengaluru', country: 'India', terminal: 'T1', latitude: 13.1986, longitude: 77.7066 },
  { name: 'Dubai International Airport', code: 'DXB', city: 'Dubai', country: 'UAE', terminal: 'T3', latitude: 25.2532, longitude: 55.3657 },
  { name: 'Singapore Changi Airport', code: 'SIN', city: 'Singapore', country: 'Singapore', terminal: 'T4', latitude: 1.3644, longitude: 103.9915 },
  { name: 'London Heathrow Airport', code: 'LHR', city: 'London', country: 'United Kingdom', terminal: 'T2', latitude: 51.4700, longitude: -0.4543 },
  { name: 'John F. Kennedy International Airport', code: 'JFK', city: 'New York', country: 'USA', terminal: 'T4', latitude: 40.6413, longitude: -73.7781 }
];

const airlinesData = [
  { name: 'Emirates', code: 'EK', logo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=200&q=80', country: 'UAE', description: 'Fly Better with Emirates', contactEmail: 'info@emirates.com', website: 'https://emirates.com' },
  { name: 'Air India', code: 'AI', logo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=200&q=80', country: 'India', description: 'Truly Indian Global Airline', contactEmail: 'support@airindia.in', website: 'https://airindia.in' },
  { name: 'IndiGo', code: '6E', logo: 'https://images.unsplash.com/photo-1519074069444-1ba4eaa1674a?auto=format&fit=crop&w=200&q=80', country: 'India', description: 'On-time & Hassle-free', contactEmail: 'help@goindigo.in', website: 'https://goindigo.in' },
  { name: 'Singapore Airlines', code: 'SQ', logo: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=200&q=80', country: 'Singapore', description: 'A Great Way to Fly', contactEmail: 'contact@singaporeair.com', website: 'https://singaporeair.com' }
];

const couponsData = [
  { code: 'SKY2026', discountType: 'percentage', discountValue: 15, minBookingAmount: 3000, maxDiscount: 1500, expiryDate: new Date('2027-12-31') },
  { code: 'FLAT1000', discountType: 'fixed', discountValue: 1000, minBookingAmount: 5000, maxDiscount: 1000, expiryDate: new Date('2027-12-31') },
  { code: 'FIRSTFLY', discountType: 'percentage', discountValue: 20, minBookingAmount: 2000, maxDiscount: 2000, expiryDate: new Date('2027-12-31') }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/flight-booking');
    console.log('Connected to MongoDB for seeding...');

    await User.deleteMany();
    await Airport.deleteMany();
    await Airline.deleteMany();
    await Flight.deleteMany();
    await Coupon.deleteMany();
    await Wallet.deleteMany();

    // Create Admin User
    const admin = await User.create({
      name: 'SkyWings Admin',
      email: 'admin@skywings.com',
      password: 'admin123',
      role: 'admin',
      phone: '+91 9876543210',
      nationality: 'Indian'
    });

    // Create Customer User
    const customer = await User.create({
      name: 'Alex Johnson',
      email: 'user@skywings.com',
      password: 'user123',
      role: 'customer',
      phone: '+91 9123456789',
      nationality: 'Indian',
      passportNumber: 'Z9876543'
    });

    await Wallet.create({ user: customer._id, balance: 1200, transactions: [{ type: 'Credit', amount: 1200, description: 'Sign up promotion' }] });
    await Wallet.create({ user: admin._id, balance: 5000, transactions: [{ type: 'Credit', amount: 5000, description: 'Admin Wallet' }] });

    const createdAirports = await Airport.insertMany(airportsData);
    const createdAirlines = await Airline.insertMany(airlinesData);
    await Coupon.insertMany(couponsData);

    const findAirport = (code) => createdAirports.find(a => a.code === code)._id;
    const findAirline = (code) => createdAirlines.find(a => a.code === code)._id;

    // Generate Flights for today and future days
    const today = new Date();

    const flightsList = [
      {
        flightNumber: 'AI-101',
        airline: findAirline('AI'),
        departureAirport: findAirport('BOM'),
        arrivalAirport: findAirport('DEL'),
        departureDate: today,
        arrivalDate: today,
        departureTime: '06:00',
        arrivalTime: '08:15',
        duration: '2h 15m',
        stops: 0,
        aircraftType: 'Airbus A320neo',
        economyPrice: 4500,
        businessPrice: 12500,
        firstClassPrice: 22000,
        availableSeats: 110,
        occupiedSeats: ['1A', '1B', '3C']
      },
      {
        flightNumber: '6E-405',
        airline: findAirline('6E'),
        departureAirport: findAirport('BOM'),
        arrivalAirport: findAirport('DEL'),
        departureDate: today,
        arrivalDate: today,
        departureTime: '11:30',
        arrivalTime: '13:45',
        duration: '2h 15m',
        stops: 0,
        aircraftType: 'Airbus A321',
        economyPrice: 3800,
        businessPrice: 9800,
        firstClassPrice: 18000,
        availableSeats: 115,
        occupiedSeats: ['5D', '6A']
      },
      {
        flightNumber: 'EK-501',
        airline: findAirline('EK'),
        departureAirport: findAirport('BOM'),
        arrivalAirport: findAirport('DXB'),
        departureDate: today,
        arrivalDate: today,
        departureTime: '04:15',
        arrivalTime: '06:00',
        duration: '3h 15m',
        stops: 0,
        aircraftType: 'Boeing 777-300ER',
        economyPrice: 14500,
        businessPrice: 42000,
        firstClassPrice: 85000,
        availableSeats: 250,
        occupiedSeats: ['2A', '2B']
      },
      {
        flightNumber: 'SQ-421',
        airline: findAirline('SQ'),
        departureAirport: findAirport('BOM'),
        arrivalAirport: findAirport('SIN'),
        departureDate: today,
        arrivalDate: today,
        departureTime: '23:45',
        arrivalTime: '07:45 (+1)',
        duration: '5h 30m',
        stops: 0,
        aircraftType: 'Airbus A350-900',
        economyPrice: 22000,
        businessPrice: 65000,
        firstClassPrice: 120000,
        availableSeats: 180,
        occupiedSeats: ['12A']
      },
      {
        flightNumber: 'AI-131',
        airline: findAirline('AI'),
        departureAirport: findAirport('DEL'),
        arrivalAirport: findAirport('LHR'),
        departureDate: today,
        arrivalDate: today,
        departureTime: '14:00',
        arrivalTime: '19:00',
        duration: '9h 30m',
        stops: 0,
        aircraftType: 'Boeing 787-8',
        economyPrice: 48000,
        businessPrice: 140000,
        firstClassPrice: 240000,
        availableSeats: 210,
        occupiedSeats: ['4A', '4B']
      },
      {
        flightNumber: 'EK-203',
        airline: findAirline('EK'),
        departureAirport: findAirport('DXB'),
        arrivalAirport: findAirport('JFK'),
        departureDate: today,
        arrivalDate: today,
        departureTime: '02:50',
        arrivalTime: '08:50',
        duration: '14h 00m',
        stops: 0,
        aircraftType: 'Airbus A380-800',
        economyPrice: 68000,
        businessPrice: 220000,
        firstClassPrice: 450000,
        availableSeats: 320,
        occupiedSeats: ['1A', '1F']
      }
    ];

    await Flight.insertMany(flightsList);

    console.log('Database seeded successfully! 🌱');
    console.log('Admin user: admin@skywings.com / admin123');
    console.log('Customer user: user@skywings.com / user123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding DB:', error);
    process.exit(1);
  }
};

seedDB();
