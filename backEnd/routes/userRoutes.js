const express = require('express');
const {
  getAllUsers,
  getUser,
  deleteUser,
  updateMe,
} = require('../controllers/userController');
const {
  singUp,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
} = require('../controllers/authController');

const router = express.Router();

router.post('/signup', singUp);
router.post('/login', login);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.patch('/updateMyPassword', protect, updatePassword);
router.patch('/updateMe', protect, updateMe);
router.delete('/deleteMe', protect, deleteUser);

router.route('/').get(getAllUsers);

module.exports = router;
