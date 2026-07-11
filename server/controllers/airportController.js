const Airport = require('../models/Airport');

// @desc    Get all airports or search by query
// @route   GET /api/airports
// @access  Public
exports.getAirports = async (req, res, next) => {
  try {
    const { query } = req.query;
    let filter = {};

    if (query) {
      const q = String(query).toLowerCase();
      filter = {
        $or: [
          { code: { $regex: q, $options: 'i' } },
          { name: { $regex: q, $options: 'i' } },
          { city: { $regex: q, $options: 'i' } },
          { country: { $regex: q, $options: 'i' } }
        ]
      };
    }

    const airports = await Airport.find(filter).limit(10);
    res.status(200).json({ success: true, count: airports.length, data: airports });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Airport
// @route   POST /api/airports
// @access  Private/Admin
exports.createAirport = async (req, res, next) => {
  try {
    const airport = await Airport.create(req.body);
    res.status(201).json({ success: true, data: airport });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Airport
// @route   PUT /api/airports/:id
// @access  Private/Admin
exports.updateAirport = async (req, res, next) => {
  try {
    const airport = await Airport.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!airport) {
      return res.status(404).json({ success: false, message: 'Airport not found' });
    }
    res.status(200).json({ success: true, data: airport });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Airport
// @route   DELETE /api/airports/:id
// @access  Private/Admin
exports.deleteAirport = async (req, res, next) => {
  try {
    const airport = await Airport.findByIdAndDelete(req.params.id);
    if (!airport) {
      return res.status(404).json({ success: false, message: 'Airport not found' });
    }
    res.status(200).json({ success: true, message: 'Airport removed' });
  } catch (error) {
    next(error);
  }
};
