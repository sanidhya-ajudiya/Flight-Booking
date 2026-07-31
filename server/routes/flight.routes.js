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
    res.json(flight);
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
