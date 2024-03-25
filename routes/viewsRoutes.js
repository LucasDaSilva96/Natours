const express = require('express');
const {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  updateUserData,
  getMyTours,
} = require('../controllers/viewsController');

const { isLoggedIn, protect } = require('../controllers/authController');

const router = express.Router();

router.get('/', isLoggedIn, getOverview);

router.get('/tour/:name', isLoggedIn, getTour);

router.get('/login', isLoggedIn, getLoginForm);

router.get('/me', protect, getAccount);
router.get('/my-tours', protect, getMyTours);

router.post('/submit-user-data', protect, updateUserData);

module.exports = router;
