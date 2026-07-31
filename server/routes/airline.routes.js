const express = require('express');
const router = express.Router();
const Airline = require('../models/Airline');
const { protect, adminOnly } = require('../middleware/auth');

// @route GET /api/airlines
router.get('/', async (req, res) => {
  try {
    const airlines = await Airline.find().sort({ name: 1 });
    res.json(airlines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/airlines (Admin Only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const airline = new Airline(req.body);
    await airline.save();
    res.status(201).json(airline);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route PUT /api/airlines/:id (Admin Only)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const airline = await Airline.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(airline);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route DELETE /api/airlines/:id (Admin Only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Airline.findByIdAndDelete(req.params.id);
    res.json({ message: 'Airline deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
