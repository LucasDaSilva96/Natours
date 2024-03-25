const Review = require(`../models/reviewModel`);
const { deleteOne, updateOne, createOne, getOne } = require('./handlerFactory');

// *? Helper function | Get all reviews
exports.getAllReviews = async (req, res) => {
  let filter = {};
  try {
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const reviews = await Review.find(filter);
    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: `ERROR: ${err.message}`,
    });
  }
};

// *? Helper function | Create review - Ex: 1
// exports.createReview = async (req, res) => {
//   try {
// Allow nested routes
//     if (!req.body.tour) req.body.tour = req.params.tourId;
//     if (!req.body.user) req.body.user = req.user.id;

//     const newReview = await Review.create(req.body);

//     res.status(201).json({
//       status: 'success',
//       data: {
//         newReview,
//       },
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: 'fail',
//       message: `ERROR: ${err.message}`,
//     });
//   }
// };

// ** Middleware function
exports.setTourAndUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  next();
};

// *? Helper function | Delete review
exports.deleteReview = deleteOne(Review);

// *? Helper function | Update review
exports.updateReview = updateOne(Review);

// *? Helper function | Create review
exports.createReview = createOne(Review);

// *? Helper function | Get review
exports.getReview = getOne(Review);
