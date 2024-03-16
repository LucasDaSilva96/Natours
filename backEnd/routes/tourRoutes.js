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
} = require('../controllers/tourController');
const { protect, resTrictTo } = require('../controllers/authController');

const router = express.Router();

// ** Param Middleware
// router.param('id', checkID);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/tour-stats').get(getTourStats);

router.route('/monthly-plan/:year').get(getMonthlyPLan);

router.route('/').get(protect, getAllTours).post(createNewTour);
router
  .route('/:id')
  .get(getSpecificTour)
  .patch(updateTour)
  .delete(protect, resTrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;
