const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const dotenv = require('dotenv');
const sendEmail = require('../utils/email');
const { promisify } = require('util');

dotenv.config({ path: './.env' });

// ** Generate token helper function
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
    algorithm: 'HS256',
  });
};

// ** Send token & status helper function
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  // *? Define cookie
  // Convert to milliseconds
  const expiryDate = new Date(
    Date.now() + Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
  );

  res.cookie('jwt', token, {
    expires: expiryDate,
    secure: process.env.NODE_ENV === 'production' ? true : false,
    httpOnly: true,
  });

  // Remove the password from the output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
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
      role: req.body.role || 'user',
    });

    createSendToken(newUser, 201, res);
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

    createSendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: `ERROR: ${err.message}`,
    });
  }
};

exports.logOut = (req, res) => {
  res.cookie('jwt', 'loggedOut', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.clearCookie('jwt');
  res.status(200).json({
    status: 'success',
  });
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
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
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
    res.locals.user = currentUser;
    next();
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      message: `${err.message}`,
    });
    next();
  }
};

// ** Is logged in Middleware, only for rendered pages (no errors)
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

// ** Restriction middleware (To make sure that only approved users have access to some functionality)
exports.resTrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array, Ex: ["admin", "lead-guide"]
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action',
      });

      return next();
    }
    next();
  };
};

// ** Reset / Forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    // 1) Get user based on posted email

    const user = await User.findOne({ email: req.body.email });
    if (!user)
      throw new Error(
        `There is no user with this email: ${req.body.email || 'unknown'}`
      );
    // 2) Generate random token
    const resetToken = user.createPasswordResetToken();
    await user.save();
    // 3) Send it back as email
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password
  and passwordConfirm to: ${resetURL}.\nIf you didn't forgot your password, please ignore this email.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10min)',
        message,
      });

      res.status(200).json({
        status: 'success',
        message: 'Token sent to email',
      });
      next();
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      res.status(500).json({
        status: 'fail',
        message: 'There was an error sending the email. Try again later.',
      });
      return next();
    }
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      message: `ERROR: ${err.message}`,
    });
    next();
  }
};
exports.resetPassword = async (req, res, next) => {
  try {
    // 1) Get the user based on the token
    const hashToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) throw new Error('Token is invalid or has expired');
    // 2) If token has not expired, and there is user, set the new password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    // 3) Update changedPasswordAt property for the user
    // 4) Log the user in, Send JWT
    createSendToken(user, 200, res);
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      message: `ERROR: ${err.message}`,
    });
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    // 1) Get the user from the collection
    const user = await User.findById(req.user.id).select('+password');
    if (!user)
      throw new Error(`No user found. Check credentials and try again.`);

    // 2) Check if posted current password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password)))
      throw new Error('Your current password is wrong');
    // 3) If so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // 4) Log the user in, send JWT
    createSendToken(user, 200, res);

    next();
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      message: `ERROR: ${err.message}`,
    });
    next();
  }
};
