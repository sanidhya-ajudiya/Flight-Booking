const Airline = require('../models/Airline');

// @desc    Get all airlines
// @route   GET /api/airlines
// @access  Public
exports.getAirlines = async (req, res, next) => {
  try {
    const airlines = await Airline.find();
    res.status(200).json({ success: true, count: airlines.length, data: airlines });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Airline
// @route   POST /api/airlines
// @access  Private/Admin
exports.createAirline = async (req, res, next) => {
  try {
    const airline = await Airline.create(req.body);
    res.status(201).json({ success: true, data: airline });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Airline
// @route   PUT /api/airlines/:id
// @access  Private/Admin
exports.updateAirline = async (req, res, next) => {
  try {
    const airline = await Airline.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!airline) {
      return res.status(404).json({ success: false, message: 'Airline not found' });
    }
    res.status(200).json({ success: true, data: airline });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Airline
// @route   DELETE /api/airlines/:id
// @access  Private/Admin
exports.deleteAirline = async (req, res, next) => {
  try {
    const airline = await Airline.findByIdAndDelete(req.params.id);
    if (!airline) {
      return res.status(404).json({ success: false, message: 'Airline not found' });
    }
    res.status(200).json({ success: true, message: 'Airline removed' });
  } catch (error) {
    next(error);
  }
};
