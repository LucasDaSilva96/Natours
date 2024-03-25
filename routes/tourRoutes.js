const express = require('express');
const {
  getAllTours,
  createNewTour,
  getSpecificTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPLan,
  getToursWithIn,
  getDistances,
  uploadTourImages,
  resizeTourImages,
} = require('../controllers/tourController');
const { protect, resTrictTo } = require('../controllers/authController');
// const { createReview } = require('../controllers/reviewController');
const reviewRouter = require('../routes/reviewRoutes');

const router = express.Router();

// ** Nested route (Ex: 1 - better)
// ** Mounting the review router in case of :id/tourId/reviews param (Re-router)
// *! We need to set mergeParams: true in the reviews router
router.use('/:tourId/reviews', reviewRouter);

// ** Param Middleware
// router.param('id', checkID);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/tour-stats').get(getTourStats);

router
  .route('/monthly-plan/:year')
  .get(protect, resTrictTo('admin', 'lead-guide', 'guide'), getMonthlyPLan);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithIn);

router.route('/distances/:latlng/unit/:unit').get(getDistances);

router
  .route('/')
  .get(getAllTours)
  .post(protect, resTrictTo('admin', 'lead-guide'), createNewTour);
router
  .route('/:id')
  .get(getSpecificTour)
  .patch(
    protect,
    resTrictTo('admin', 'lead-guide'),
    uploadTourImages,
    resizeTourImages,
    updateTour
  )
  .delete(protect, resTrictTo('admin', 'lead-guide'), deleteTour);

// ** Nested route (Ex: 2)
// POST /tour:id/reviews
// GET /tour:id/reviews || GET /tour/:id/reviews/:id
// router
//   .route('/:tourId/reviews')
//   .post(protect, resTrictTo('user'), createReview);

module.exports = router;
