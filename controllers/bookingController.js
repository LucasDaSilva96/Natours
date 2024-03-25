const Tour = require('../models/tourModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/bookingModel');
const {
  createOne,
  getOne,
  getAll,
  updateOne,
  deleteOne,
} = require('../controllers/handlerFactory');

exports.getCheckoutSession = async (req, res, next) => {
  try {
    const { tourID } = req.params;
    // 1) Get the currently booked tour
    const tour = await Tour.findById(tourID);
    // 2) Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: req.user.email,
      client_reference_id: tourID,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tour.name} Tour`,
              description: tour.summary,
              images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
            },
            unit_amount: tour.price * 100, // in cent
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:8000/?tour=${tourID}&user=${req.user.id}&price=${tour.price}`,
      cancel_url: `http://localhost:8000/tour/${tour.slug}`,
    });
    // 3) Create session as response
    res.status(200).json({
      status: 'success',
      session,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: `ERROR: ${err.message}`,
    });
  }
};

exports.createBookingCheckout = async (req, res, next) => {
  try {
    // TODO this is only TEMPORARY, because it's UNSECURE: everyone can make booking without paying
    const { tour, user, price } = req.query;

    if (!tour && !user && !price) return next();

    await Booking.create({ tour, user, price });

    res.redirect(req.originalUrl.split('?')[0]);
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: `ERROR: ${err.message}`,
    });
  }
};

// Create
exports.createBooking = createOne(Booking);

// Read
exports.getBooking = getOne(Booking);
exports.getAllBookings = getAll(Booking);

// Update
exports.updateBooking = updateOne(Booking);

// Delete
exports.deleteBooking = deleteOne(Booking);