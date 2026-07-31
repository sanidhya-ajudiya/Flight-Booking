const express = require('express');
const router = express.Router();
const Flight = require('../models/Flight');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Airport = require('../models/Airport');
const Airline = require('../models/Airline');
const Refund = require('../models/Refund');
const Coupon = require('../models/Coupon');
const { protect, adminOnly } = require('../middleware/auth');

// @route GET /api/analytics/dashboard
router.get('/dashboard', protect, adminOnly, async (req, res) => {
  try {
    const totalFlights = await Flight.countDocuments();
    const activeFlights = await Flight.countDocuments({ status: { $in: ['Scheduled', 'On-Time', 'In-Flight'] } });
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    
    const todayFlights = await Flight.countDocuments({
      departureDate: { $gte: todayStart, $lte: todayEnd }
    });

    const totalBookings = await Booking.countDocuments();
    const cancelledBookings = await Booking.countDocuments({ status: 'Cancelled' });
    
    const revenueData = await Booking.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const revenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    const customers = await User.countDocuments({ role: 'customer' });
    const airportsCount = await Airport.countDocuments();
    const airlinesCount = await Airline.countDocuments();
    const refundRequests = await Refund.countDocuments({ status: 'Requested' });
    const couponsCount = await Coupon.countDocuments({ isActive: true });

    // Monthly Booking Graph Data (Last 6 Months)
    const monthlyBookings = [
      { month: 'Feb', bookings: 45, revenue: 285000 },
      { month: 'Mar', bookings: 62, revenue: 410000 },
      { month: 'Apr', bookings: 85, revenue: 590000 },
      { month: 'May', bookings: 110, revenue: 780000 },
      { month: 'Jun', bookings: 145, revenue: 950000 },
      { month: 'Jul', bookings: totalBookings, revenue: revenue }
    ];

    // Popular Routes Mock Aggregation
    const popularRoutes = [
      { route: 'BOM -> DEL (Mumbai to Delhi)', bookings: 42, percentage: 32 },
      { route: 'DEL -> SIN (Delhi to Singapore)', bookings: 28, percentage: 21 },
      { route: 'BOM -> DXB (Mumbai to Dubai)', bookings: 25, percentage: 19 },
      { route: 'BLR -> LHR (Bengaluru to London)', bookings: 18, percentage: 14 },
      { route: 'DEL -> JFK (Delhi to New York)', bookings: 12, percentage: 9 }
    ];

    // Recent Bookings
    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .populate({
        path: 'flight',
        populate: ['departureAirport', 'arrivalAirport']
      })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      kpis: {
        totalFlights,
        activeFlights,
        todayFlights,
        totalBookings,
        cancelledBookings,
        revenue,
        customers,
        airportsCount,
        airlinesCount,
        refundRequests,
        couponsCount
      },
      monthlyBookings,
      popularRoutes,
      recentBookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
