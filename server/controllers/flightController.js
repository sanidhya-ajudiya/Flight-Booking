const Flight = require('../models/Flight');
const Airport = require('../models/Airport');
const Airline = require('../models/Airline');

// Mapper: Format Flight to Client Model
const mapFlightToClientModel = (flight, cabinClass = 'economy') => {
  const basePrice = flight.prices[cabinClass] || flight.prices.economy;
  const taxes = Math.round(basePrice * 0.18);
  const gst = Math.round(basePrice * 0.05);
  const total = basePrice + taxes + gst;
  const seatsAvailable = (flight.seats[cabinClass] || 0) - ((flight.seatsBooked && flight.seatsBooked[cabinClass] ? flight.seatsBooked[cabinClass].length : 0));

  return {
    id: flight._id,
    segments: [{
      flightNumber: flight.flightNumber,
      airline: flight.airline,
      origin: flight.origin,
      destination: flight.destination,
      departureTime: flight.departureTime.toISOString(),
      arrivalTime: flight.arrivalTime.toISOString(),
      duration: flight.duration,
      aircraft: flight.aircraft,
      stops: flight.stops,
      stopDetails: flight.stopDetails,
      baggageAllowance: flight.baggageAllowance
    }],
    price: {
      base: basePrice,
      taxes,
      gst,
      total,
      currency: 'INR',
      pricePerPassenger: total
    },
    cabinClass: cabinClass,
    seatsAvailable: Math.max(0, seatsAvailable),
    refundable: flight.refundable,
    fareType: flight.fareType,
    amenities: flight.amenities,
    rating: flight.rating,
    onTimePerformance: flight.onTimePerformance
  };
};

// @desc    Search flights
// @route   GET /api/flights/search
// @access  Public
exports.searchFlights = async (req, res, next) => {
  try {
    const {
      origin,          // Airport code, e.g. BOM
      destination,     // Airport code, e.g. DEL
      departureDate,   // ISO date string
      cabinClass = 'economy',
      sortBy = 'price'
    } = req.query;

    if (!origin || !destination) {
      return res.status(400).json({ success: false, message: 'Origin and destination airport codes are required' });
    }

    // Find origin & destination airports in database
    const originAirport = await Airport.findOne({ code: origin.toUpperCase() });
    const destAirport = await Airport.findOne({ code: destination.toUpperCase() });

    if (!originAirport || !destAirport) {
      return res.status(404).json({ success: false, message: 'Origin or Destination airport not found' });
    }

    // Setup date query
    const startOfDay = departureDate ? new Date(departureDate) : new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = departureDate ? new Date(departureDate) : new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Query flights
    const flights = await Flight.find({
      origin: originAirport._id,
      destination: destAirport._id,
      departureTime: { $gte: startOfDay, $lte: endOfDay },
      status: 'scheduled'
    })
      .populate('airline')
      .populate('origin')
      .populate('destination')
      .populate('stopDetails.airport');

    // Map flights
    let mappedFlights = flights.map(flight => mapFlightToClientModel(flight, cabinClass));

    // Sort flights
    if (sortBy === 'price') {
      mappedFlights.sort((a, b) => a.price.total - b.price.total);
    } else if (sortBy === 'duration') {
      mappedFlights.sort((a, b) => a.segments[0].duration - b.segments[0].duration);
    } else if (sortBy === 'departure') {
      mappedFlights.sort((a, b) => new Date(a.segments[0].departureTime).getTime() - new Date(b.segments[0].departureTime).getTime());
    } else if (sortBy === 'arrival') {
      mappedFlights.sort((a, b) => new Date(a.segments[0].arrivalTime).getTime() - new Date(b.segments[0].arrivalTime).getTime());
    }

    res.status(200).json({ success: true, count: mappedFlights.length, data: mappedFlights });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Flight by ID
// @route   GET /api/flights/:id
// @access  Public
exports.getFlightById = async (req, res, next) => {
  try {
    const { cabinClass = 'economy' } = req.query;
    const flight = await Flight.findById(req.params.id)
      .populate('airline')
      .populate('origin')
      .populate('destination')
      .populate('stopDetails.airport');

    if (!flight) {
      return res.status(404).json({ success: false, message: 'Flight not found' });
    }

    const mapped = mapFlightToClientModel(flight, cabinClass);
    res.status(200).json({ success: true, data: mapped });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all flights (For Admin)
// @route   GET /api/flights
// @access  Private/Admin
exports.getAllFlights = async (req, res, next) => {
  try {
    const flights = await Flight.find()
      .populate('airline')
      .populate('origin')
      .populate('destination');

    const mapped = flights.map(f => mapFlightToClientModel(f, 'economy'));
    res.status(200).json({ success: true, count: mapped.length, data: mapped });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Flight
// @route   POST /api/flights
// @access  Private/Admin
exports.createFlight = async (req, res, next) => {
  try {
    const flight = await Flight.create(req.body);
    const populated = await Flight.findById(flight._id)
      .populate('airline')
      .populate('origin')
      .populate('destination');
    const mapped = mapFlightToClientModel(populated, 'economy');
    res.status(201).json({ success: true, data: mapped });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Flight
// @route   PUT /api/flights/:id
// @access  Private/Admin
exports.updateFlight = async (req, res, next) => {
  try {
    const flight = await Flight.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('airline').populate('origin').populate('destination');

    if (!flight) {
      return res.status(404).json({ success: false, message: 'Flight not found' });
    }

    const mapped = mapFlightToClientModel(flight, 'economy');
    res.status(200).json({ success: true, data: mapped });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Flight
// @route   DELETE /api/flights/:id
// @access  Private/Admin
exports.deleteFlight = async (req, res, next) => {
  try {
    const flight = await Flight.findByIdAndDelete(req.params.id);
    if (!flight) {
      return res.status(404).json({ success: false, message: 'Flight not found' });
    }
    res.status(200).json({ success: true, message: 'Flight deleted successfully' });
  } catch (error) {
    next(error);
  }
};
