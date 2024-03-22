const Tour = require('./../models/tourModel');
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require('./handlerFactory');

// ** Middleware
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';

  next();
};

// * Read the sample-file | Tours
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// *? Helper function | Tours - Middleware
// request, response, next, value(id↓)

// *? Helper function | Tours - Middleware
// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price',
//     });
//   }
//   next();
// };

// *? Helper function | Tours
exports.getAllTours = getAll(Tour);
// exports.getAllTours = async (req, res) => {
//   try {
// ** Filter method 1
// const tours = await Tour.find()
//   .where('duration')
//   .equals(5)
//   .where('difficulty')
//   .equals('easy');

// * Execute query
//     const features = new APIFeatures(Tour.find(), req.query)
//       .filter()
//       .sort()
//       .limitField()
//       .pagination();

//     const tours = await features.query;

// * Send response
//     res.status(200).json({
//       status: 'success',
//       results: tours.length,
//       data: {
//         tours,
//       },
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: 'fail',
//       message: `ERROR: ${err.message}`,
//     });
//   }
// };

// *? Helper function | Tours
exports.getSpecificTour = getOne(Tour, { path: 'reviews' });

// exports.getSpecificTour = async (req, res) => {
//   const { id } = req.params;

//   try {
// ** Virtual populate (tour & review)
//     const tour = await Tour.findById(id).populate('reviews');
//     if (!tour) throw new Error('The tour was not found');

//     res.status(200).json({
//       status: 'success',
//       results: 1,
//       data: {
//         tour,
//       },
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: 'fail',
//       message: `ERROR: ${err.message}`,
//     });
//   }
// };

// const catchAsync = (fn) => {
//   return (req, res, next) => {
//     fn(req, res, next).catch(next);
//   };
// };

// *? Helper function | Tours
exports.createNewTour = createOne(Tour);
// exports.createNewTour = async (req, res) => {
//   try {
//     const newTour = await Tour.create(req.body);

//     res.status(201).json({
//       status: 'success',
//       data: {
//         newTour,
//       },
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: 'fail',
//       message: `ERROR: ${err.message}`,
//     });
//   }
// };

// *? Helper function | Update Tour
exports.updateTour = updateOne(Tour);
// exports.updateTour = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const updatedTour = await Tour.findByIdAndUpdate(id, req.body, {
//       new: true,
//       runValidators: true,
//     });

//     res.status(200).json({
//       status: 'success',
//       data: {
//         tour: updatedTour,
//       },
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: 'fail',
//       message: `ERROR: ${err.message}`,
//     });
//   }
// };

// *? Helper function | Delete Tour
exports.deleteTour = deleteOne(Tour);
// exports.deleteTour = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await Tour.findByIdAndDelete(id, (err, doc) => {
//       if (err) throw new Error(err);
//       console.log('Deleted');
//     });

//     res.status(204).json({
//       status: 'success',
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: 'fail',
//       message: `ERROR: ${err.message}`,
//     });
//   }
// };

// ************* Stats helper functions
exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRating: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
      // {
      //   $match: { _id: { $ne: 'EASY' } },
      // },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: `ERROR: ${err.message}`,
    });
  }
};

exports.getMonthlyPLan = async (req, res) => {
  try {
    const year = Number(req.params.year); // 2021
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: { numTourStarts: -1 },
      },
      {
        $limit: 12,
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: `ERROR: ${err.message}`,
    });
  }
};

exports.getToursWithIn = async (req, res, next) => {
  try {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng) throw new Error('Please provide longitude and latitude');

    const tours = await Tour.find({
      startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    });

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        data: tours,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: `ERROR: ${err.message}`,
    });
  }
};

exports.getDistances = async (req, res, nex) => {
  try {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    if (!lat || !lng) throw new Error('Please provide longitude and latitude');

    const multiplier = unit === 'mi' ? 0.000621371192 : 0.001;

    const distances = await Tour.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng * 1, lat * 1],
          },
          distanceField: 'distance',
          distanceMultiplier: multiplier,
        },
      },
      {
        $project: {
          distance: 1,
          name: 1,
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        data: distances,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: `ERROR: ${err.message}`,
    });
  }
};
