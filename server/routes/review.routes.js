const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Flight = require('../models/Flight');
const { protect, adminOnly } = require('../middleware/auth');

// @route POST /api/reviews
router.post('/', protect, async (req, res) => {
  try {
    const { flightId, rating, comment } = req.body;

    if (!flightId || !rating || !comment) {
      return res.status(400).json({ message: 'Flight ID, rating (1-5), and comment are required' });
    }

    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    const review = await Review.create({
      user: req.user._id,
      flight: flightId,
      rating: Math.min(5, Math.max(1, Number(rating))),
      comment
    });

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name avatar')
      .populate('flight', 'flightNumber');

    res.status(201).json(populatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/reviews/flight/:flightId
router.get('/flight/:flightId', async (req, res) => {
  try {
    const reviews = await Review.find({ flight: req.params.flightId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    const avgRating = reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : null;

    res.json({ reviews, avgRating, totalReviews: reviews.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/reviews (All reviews for Homepage / Testimonials / Admin)
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name avatar')
      .populate('flight', 'flightNumber aircraftType')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route DELETE /api/reviews/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await review.deleteOne();
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
