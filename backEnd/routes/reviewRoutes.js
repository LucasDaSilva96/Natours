const express = require('express');

const {
  getAllReviews,
  createReview,
} = require('../controllers/reviewController');
const { protect, resTrictTo } = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(getAllReviews)
  .post(protect, resTrictTo('user'), createReview);

module.exports = router;
