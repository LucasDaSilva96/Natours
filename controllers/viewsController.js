const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');

exports.getOverview = async (req, res) => {
  try {
    const tours = await Tour.find();

    res.status(200).render('overview', {
      title: 'All Tours',
      tours,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: `ERROR: ${err.message}`,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const { name } = req.params;
    const tour = await Tour.findOne({ slug: name }).populate({
      path: 'reviews',
      fields: 'review rating user',
    });

    if (!tour) throw new Error('There is no tour with that name');
    res.status(200).render('tour', {
      title: `${tour.name} tour`.toUpperCase(),
      tour,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: `ERROR: ${err.message}`,
    });
  }
};

exports.getLoginForm = async (req, res) => {
  try {
    res.status(200).render('login', {
      title: 'Log into your account',
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: `ERROR: ${err.message}`,
    });
  }
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Account overview',
  });
};

exports.updateUserData = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.body.id,
      {
        name: req.body.name,
        email: req.body.email,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(200).render('account', {
      title: 'Account overview',
      user,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: `ERROR: ${err.message}`,
    });
  }
};

// ** Get all bookings for the current user & Render result
exports.getMyTours = async (req, res, next) => {
  try {
    // 1) Find all bookings
    const bookings = await Booking.find({ user: req.user.id });
    // 2) Find tours with the returned ID's
    const tourIDs = bookings.map((el) => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIDs } });
    res.status(200).render('overview', {
      title: 'My Tours',
      tours,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: `ERROR: ${err.message}`,
    });
  }
};
