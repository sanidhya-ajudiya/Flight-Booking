const express = require('express');
const router = express.Router();
const Flight = require('../models/Flight');
const Airport = require('../models/Airport');
const Airline = require('../models/Airline');
const { protect, adminOnly } = require('../middleware/auth');

// @route GET /api/flights/search
router.get('/search', async (req, res) => {
  try {
    const { origin, destination, departureDate, cabinClass, stops, maxPrice, airlineId, sortBy } = req.query;

    let query = {};

    if (origin) {
      const depAirport = await Airport.findOne({ code: origin.toUpperCase() });
      if (depAirport) {
        query.departureAirport = depAirport._id;
      }
    }

    if (destination) {
      const arrAirport = await Airport.findOne({ code: destination.toUpperCase() });
      if (arrAirport) {
        query.arrivalAirport = arrAirport._id;
      }
    }

    if (departureDate) {
      const startOfDay = new Date(departureDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(departureDate);
      endOfDay.setHours(23, 59, 59, 999);
      query.departureDate = { $gte: startOfDay, $lte: endOfDay };
    }

    if (stops !== undefined && stops !== '') {
      query.stops = Number(stops);
    }

    if (airlineId) {
      query.airline = airlineId;
    }

    if (maxPrice) {
      const priceField = cabinClass === 'business' ? 'businessPrice' : cabinClass === 'firstClass' ? 'firstClassPrice' : 'economyPrice';
      query[priceField] = { $lte: Number(maxPrice) };
    }

    let sortOptions = { departureTime: 1 };
    if (sortBy === 'price_asc') {
      const priceField = cabinClass === 'business' ? 'businessPrice' : cabinClass === 'firstClass' ? 'firstClassPrice' : 'economyPrice';
      sortOptions = { [priceField]: 1 };
    } else if (sortBy === 'price_desc') {
      const priceField = cabinClass === 'business' ? 'businessPrice' : cabinClass === 'firstClass' ? 'firstClassPrice' : 'economyPrice';
      sortOptions = { [priceField]: -1 };
    } else if (sortBy === 'duration') {
      sortOptions = { duration: 1 };
    }

    const flights = await Flight.find(query)
      .populate('airline')
      .populate('departureAirport')
      .populate('arrivalAirport')
      .sort(sortOptions);

    res.json(flights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/flights
router.get('/', async (req, res) => {
  try {
    const flights = await Flight.find()
      .populate('airline')
      .populate('departureAirport')
      .populate('arrivalAirport')
      .sort({ departureDate: 1 });
    res.json(flights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/flights/live-status (Public Live Flight Status)
router.get('/live-status', async (req, res) => {
  try {
    const { flightNumber, date } = req.query;
    let query = {};

    if (flightNumber) {
      query.flightNumber = new RegExp(flightNumber.trim(), 'i');
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.departureDate = { $gte: startOfDay, $lte: endOfDay };
    }

    const flights = await Flight.find(query)
      .populate('airline')
      .populate('departureAirport')
      .populate('arrivalAirport')
      .sort({ departureDate: -1, departureTime: 1 })
      .limit(20);

    res.json(flights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/flights/:id
router.get('/:id', async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id)
      .populate('airline')
      .populate('departureAirport')
      .populate('arrivalAirport');

    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    // Clean up expired locks
    const now = new Date();
    if (flight.lockedSeats && flight.lockedSeats.length > 0) {
      flight.lockedSeats = flight.lockedSeats.filter(l => l.lockedUntil > now);
      await flight.save();
    }

    res.json(flight);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/flights/:id/lock-seats (Temporary 10-Minute Seat Reservation)
router.post('/:id/lock-seats', protect, async (req, res) => {
  try {
    const { seats } = req.body; // e.g. ["12A", "12B"]
    if (!Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ message: 'Seats array is required' });
    }

    const flight = await Flight.findById(req.params.id);
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    const now = new Date();
    // Remove expired locks
    flight.lockedSeats = (flight.lockedSeats || []).filter(l => l.lockedUntil > now);

    // Check if any requested seat is permanently booked
    const conflictOccupied = seats.find(s => flight.occupiedSeats.includes(s));
    if (conflictOccupied) {
      return res.status(409).json({ message: `Seat ${conflictOccupied} is already booked` });
    }

    // Check if any requested seat is locked by someone else
    const conflictLocked = flight.lockedSeats.find(l => 
      seats.includes(l.seatNumber) && l.userId.toString() !== req.user._id.toString()
    );
    if (conflictLocked) {
      return res.status(409).json({ message: `Seat ${conflictLocked.seatNumber} is currently selected by another passenger` });
    }

    // Lock seats for 10 minutes (TTL)
    const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);
    // Remove previous locks by this user on this flight
    flight.lockedSeats = flight.lockedSeats.filter(l => l.userId.toString() !== req.user._id.toString());
    
    seats.forEach(seat => {
      flight.lockedSeats.push({
        seatNumber: seat,
        userId: req.user._id,
        lockedUntil: tenMinutesLater
      });
    });

    await flight.save();
    res.json({ message: 'Seats successfully locked for 10 minutes', lockedSeats: seats, expiresAt: tenMinutesLater });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/flights/:id/unlock-seats
router.post('/:id/unlock-seats', protect, async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (flight) {
      flight.lockedSeats = (flight.lockedSeats || []).filter(l => l.userId.toString() !== req.user._id.toString());
      await flight.save();
    }
    res.json({ message: 'Seats unlocked' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/flights (Admin Only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const flight = new Flight(req.body);
    const savedFlight = await flight.save();
    const populated = await Flight.findById(savedFlight._id)
      .populate('airline')
      .populate('departureAirport')
      .populate('arrivalAirport');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route PUT /api/flights/:id (Admin Only)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const flight = await Flight.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('airline')
      .populate('departureAirport')
      .populate('arrivalAirport');
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    res.json(flight);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route PATCH /api/flights/:id/status (Admin Only)
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const flight = await Flight.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate('airline')
      .populate('departureAirport')
      .populate('arrivalAirport');
    res.json(flight);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route DELETE /api/flights/:id (Admin Only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const flight = await Flight.findByIdAndDelete(req.params.id);
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    res.json({ message: 'Flight deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
