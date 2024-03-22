const mongoose = require('mongoose');
const Tour = require('./tourModel');

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

// ** This is for making sure that the user only writes on review per tour (PREVENTING DUPLICATE)
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

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

// ** Calculating average rating on tours ↓
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

// *? post = after save
reviewSchema.post('save', function (next) {
  // this points to current review
  // Review.calcAverageRatings(this.tour);
  this.constructor.calcAverageRatings(this.tour);

  next();
});

// findByIdAndUpdate
// findByIdAndDelete
// *? pre = before save
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();

  next();
});

reviewSchema.post(/^findOneAnd/, async function (next) {
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

// ** REVIEW - MODEL
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

// ** Nested route
// POST /tour:id/reviews
// GET /tour:id/reviews || GET /tour/:id/reviews/:id
