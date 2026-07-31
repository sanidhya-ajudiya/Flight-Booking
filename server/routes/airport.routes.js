const express = require('express');
const router = express.Router();
const Airport = require('../models/Airport');
const { protect, adminOnly } = require('../middleware/auth');

// @route GET /api/airports
router.get('/', async (req, res) => {
  try {
    const airports = await Airport.find().sort({ city: 1 });
    res.json(airports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/airports (Admin Only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const airport = new Airport(req.body);
    await airport.save();
    res.status(201).json(airport);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route PUT /api/airports/:id (Admin Only)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const airport = await Airport.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(airport);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route DELETE /api/airports/:id (Admin Only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Airport.findByIdAndDelete(req.params.id);
    res.json({ message: 'Airport deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
