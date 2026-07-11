const User = require('../models/User');
const Flight = require('../models/Flight');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const reportService = require('../services/reportService');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalFlights = await Flight.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const activeFlights = await Flight.countDocuments({ status: 'scheduled' });

    // Calculate revenue
    const confirmedBookings = await Booking.find({ status: 'confirmed' });
    const revenue = confirmedBookings.reduce((sum, b) => sum + (b.totalPrice ? b.totalPrice.total : 0), 0);

    // Today's Bookings
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todaysBookings = await Booking.countDocuments({ createdAt: { $gte: startOfToday } });

    // Recent Bookings
    const recentBookings = await Booking.find()
      .populate('user')
      .populate({
        path: 'flight',
        populate: [
          { path: 'airline' },
          { path: 'origin' },
          { path: 'destination' }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(5);

    // Monthly revenue mock/aggregate for current year
    const monthlyRevenue = [
      { month: 'Jan', amount: Math.round(revenue * 0.1) },
      { month: 'Feb', amount: Math.round(revenue * 0.12) },
      { month: 'Mar', amount: Math.round(revenue * 0.15) },
      { month: 'Apr', amount: Math.round(revenue * 0.18) },
      { month: 'May', amount: Math.round(revenue * 0.2) },
      { month: 'Jun', amount: Math.round(revenue * 0.25) }
    ];

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalFlights,
        totalBookings,
        revenue,
        activeFlights,
        todaysBookings,
        recentBookings,
        monthlyRevenue
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export Reports
// @route   GET /api/admin/reports/:type/export
// @access  Private/Admin
exports.exportReport = async (req, res, next) => {
  try {
    const { type } = req.params; // booking, revenue, user, flight
    let csvData = '';

    if (type === 'booking') {
      const bookings = await Booking.find().populate('flight');
      csvData = reportService.generateBookingReport(bookings);
    } else if (type === 'revenue') {
      const payments = await Payment.find().populate('booking');
      csvData = reportService.generateRevenueReport(payments);
    } else if (type === 'user') {
      const users = await User.find();
      csvData = reportService.generateUserReport(users);
    } else if (type === 'flight') {
      const flights = await Flight.find().populate('airline').populate('origin').populate('destination');
      csvData = reportService.generateFlightReport(flights);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid report type' });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=SkyWings_${type}_Report_${Date.now()}.csv`);
    res.status(200).send(csvData);
  } catch (error) {
    next(error);
  }
};
