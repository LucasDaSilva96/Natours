const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      // Reference to the Tour-model
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      // Reference to the User-model
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ** Populate Middleware
reviewSchema.pre(/^find/, function (next) {
  // this.populate([
  //   { path: 'tour', select: 'name' },
  //   { path: 'user', select: 'name photo' },
  // ]);
  // next();
  this.populate({ path: 'user', select: 'name photo' });
  next();
});

// ** REVIEW - MODEL
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

// ** Nested route
// POST /tour:id/reviews
// GET /tour:id/reviews || GET /tour/:id/reviews/:id
