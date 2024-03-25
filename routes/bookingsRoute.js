const express = require('express');
const {
  getCheckoutSession,
  createBooking,
  getBooking,
  getAllBookings,
  updateBooking,
  deleteBooking,
} = require('../controllers/bookingController');
const { protect, resTrictTo } = require('../controllers/authController');

const router = express.Router();

router.use(protect);

router.get('/checkout-session/:tourID', protect, getCheckoutSession);

router.use(resTrictTo('admin', 'lead-guide'));

router.get('/', getAllBookings).post(createBooking);

router.get('/:id', getBooking).patch(updateBooking).delete(deleteBooking);

module.exports = router;
