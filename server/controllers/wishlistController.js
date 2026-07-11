const Wishlist = require('../models/Wishlist');

// @desc    Get User Wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id }).populate({
      path: 'flights',
      populate: [
        { path: 'airline' },
        { path: 'origin' },
        { path: 'destination' }
      ]
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, flights: [] });
    }

    res.status(200).json({ success: true, count: wishlist.flights.length, data: wishlist.flights });
  } catch (error) {
    next(error);
  }
};

// @desc    Add Flight to Wishlist
// @route   POST /api/wishlist
// @access  Private
exports.addToWishlist = async (req, res, next) => {
  try {
    const { flightId } = req.body;

    let wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, flights: [] });
    }

    if (wishlist.flights.includes(flightId)) {
      return res.status(400).json({ success: false, message: 'Flight already in wishlist' });
    }

    wishlist.flights.push(flightId);
    await wishlist.save();

    res.status(200).json({ success: true, message: 'Flight added to wishlist', data: wishlist });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove Flight from Wishlist
// @route   DELETE /api/wishlist/:flightId
// @access  Private
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const { flightId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }

    wishlist.flights = wishlist.flights.filter(f => f.toString() !== flightId);
    await wishlist.save();

    res.status(200).json({ success: true, message: 'Flight removed from wishlist', data: wishlist });
  } catch (error) {
    next(error);
  }
};
