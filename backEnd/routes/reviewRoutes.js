const express = require('express');

const {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  setTourAndUserIds,
  getReview,
} = require('../controllers/reviewController');
const { protect, resTrictTo } = require('../controllers/authController');

// ** We need to merge in order for the tour router to work properly with the
// ** reviews router
const router = express.Router({
  mergeParams: true,
});

// POST /tour:id/reviews
// GET /tour:id/reviews || GET /tour/:id/reviews/:id

// ** Protect all routes after this Middleware
router.use(protect);

router
  .route('/')
  .get(getAllReviews)
  .post(resTrictTo('user'), setTourAndUserIds, createReview);

router.get('/:id').get(getReview);

// ** Protect all routes after this Middleware
router.use(resTrictTo('user', 'admin'));

router.delete(deleteReview).patch(updateReview);

module.exports = router;
