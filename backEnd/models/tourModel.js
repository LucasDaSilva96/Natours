const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require('./userModel');
// ** TOUR - SCHEMA
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxLength: [40, 'A tour name must have less or equal 40 characters'],
      minLength: [10, 'A tour name must have more or equal to 10 characters'],
      // validate: [validator.isAlpha, 'A tour name can only contain characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above or equal to 1.0'],
      max: [5, 'Rating must be less or equal to 5'],
      set: (val) => Number(val).toFixed(2),
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (value) {
          // this only points to current doc on NEW document creation
          return value < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      // use .select("+example") to select this field
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    //** Embedding
    // guides: Array,
    // ** Reference
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        // Reference to another model, in this case the User-model
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ** This is for better performance when looking through a huge DB (Indexes)
// ** 1 = Ascending order || -1 = descending order
// tourSchema.index({ price: 1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });
// ** Compound Indexes, also for better performance
tourSchema.index({ price: 1, ratingsAverage: -1 });

// ** Virtual property
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// ** Virtual populate (tour and review)
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// ** DOCUMENT Middleware: Runs before .save() and .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// ** Embedding Middleware
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);

//   next();
// });

// ** Populate Middleware (Everything that starts with find...findById, find and so on)
tourSchema.pre(/^find/, function (next) {
  // populate = replaces id with the actual data in the guides field
  this.populate({
    path: 'guides',
    // Remove those field from the object when displaying
    select: '-__v -passwordChangedAt',
  });
  next();
});

// ** QUERY Middleware (Everything that starts with find...findById, find and so on)
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

// ** AGGREGATION Middleware
// tourSchema.pre('aggregate', function (next) {
//   this._pipeline.unshift({ $match: { secretTour: { $ne: true } } });
//   // console.log(this._pipeline);
//   next();
// });

// ** TOUR - MODEL
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
