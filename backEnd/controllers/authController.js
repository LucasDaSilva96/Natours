const { promisify } = require('util');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

// ** Generate token helper function
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
    algorithm: 'HS256',
  });
};

exports.singUp = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      photo: req.body.photo || undefined,
      passwordChangedAt: req.body.passwordChangedAt || undefined,
    });

    const token = signToken(newUser._id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: `ERROR: ${err.message}`,
    });
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // 1) Check if email and password exist
    if (!email || !password) {
      res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password',
      });
      return next();
    }

    // 2) Check if the user exist & password is correct
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password',
      });
      return next();
    }

    const correct = await user.correctPassword(password, user.password);

    if (!correct) {
      res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password',
      });

      return next();
    }

    // 3) If everything is ok, send token to the client
    const token = signToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: `ERROR: ${err.message}`,
    });
  }
};

// ** Middleware (protect information if the user is not logged in)
exports.protect = async (req, res, next) => {
  try {
    let token,
      decoded = undefined;
    // 1) Getting the token and check if it's there
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        status: 'fail',
        message: 'Please log in first',
      });
      return next();
    }

    // 2) Verification token

    // const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    jwt.verify(token, process.env.JWT_SECRET, (err, deco) => {
      if (err) {
        throw new Error(err.message);
      } else {
        decoded = deco;
      }
    });

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      throw new Error('The user belonging to the token does not exist');
    }
    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      throw new Error('User recently changed password. Please log in again');
    }

    // Grant access to the protected route
    req.user = currentUser;
    next();
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      message: `${err.message}`,
    });
    next();
  }
};
