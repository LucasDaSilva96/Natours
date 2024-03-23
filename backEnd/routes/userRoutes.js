const express = require('express');
const {
  getAllUsers,
  deleteUser,
  updateMe,
  getUser,
  createUserByAdmin,
} = require('../controllers/userController');
const {
  singUp,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  resTrictTo,
  logOut,
} = require('../controllers/authController');
const { getMe } = require('../controllers/handlerFactory');

const router = express.Router();

router.post('/signup', singUp);
router.post('/login', login);
router.get('/logout', logOut);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

// ** Protect all routes after this Middleware
router.use(protect);
router.patch('/updateMyPassword', protect, updatePassword);

router.get('/me', getMe, getUser);

// ** Protect all routes after this Middleware
router.use(resTrictTo('admin'));

router.patch('/updateMe', updateMe);
router.delete('/:id', deleteUser);
router.get('/:id', getUser);
router.route('/').get(getAllUsers);
router.post('/', createUserByAdmin);

module.exports = router;
