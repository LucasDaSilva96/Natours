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
const User = require('../models/userModel');

exports.getCheckoutSession = async (req, res, next) => {
  try {
    const { tourID } = req.params;
    // if (!tourID) throw new Error('TourID is undefined');
    // 1) Get the currently booked tour
    const tour = await Tour.findById(tourID);
    // 2) Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      success_url: `${req.protocol}://${req.get('host')}/my-tours`,
      cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
      customer_email: req.user.email,
      client_reference_id: req.params.tourId,
      metaData: {
        tourID,
      },
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: tour.price * 100,
            product_data: {
              name: `${tour.name} Tour`,
              description: tour.summary,
              images: [
                `${req.protocol}://${req.get('host')}/img/tours/${
                  tour.imageCover
                }`,
              ],
            },
          },
        },
      ],
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

// exports.createBookingCheckout = async (req, res, next) => {
//   try {
//     // TODO this is only TEMPORARY, because it's UNSECURE: everyone can make booking without paying
//     const { tour, user, price } = req.query;

//     if (!tour && !user && !price) return next();

//     await Booking.create({ tour, user, price });

//     res.redirect(req.originalUrl.split('?')[0]);
//   } catch (err) {
//     res.status(400).json({
//       status: 'fail',
//       message: `ERROR: ${err.message}`,
//     });
//   }
// };

// ** This is for stripe

const createBookingCheckout = async (session) => {
  try {
    const tourId = session.client_reference_id;
    const tour = await Tour.findById(tourId);
    const user = await User.findOne({ email: session.customer_email });
    const price = session.amount_total / 100;
    await Booking.create({ tour: tour._id, user: user._id, price });
  } catch (err) {
    throw new Error(err.message);
  }
};

// ** This is for stripe
exports.webHookCheckout = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed')
    await createBookingCheckout(event.data.object);

  res.status(200).json({
    received: true,
  });
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
