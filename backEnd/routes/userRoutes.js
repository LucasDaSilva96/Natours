const express = require('express');
const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const {
  singUp,
  login,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');

const router = express.Router();

router.post('/signup', singUp);
router.post('/login', login);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.route('/').get(getAllUsers);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
