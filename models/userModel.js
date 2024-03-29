const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

// ** USER - SCHEMA
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
    trim: true,
    minLength: [3, 'A user name must have more or equal to 3 characters'],
    maxLength: [40, 'A user name must have less or equal to 40 characters'],
  },
  email: {
    type: String,
    required: [true, 'A user must enter a valid email'],
    unique: true,
    lowerCase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Enter a valid password'],
    minLength: [8, 'A password must have more or equal to 10 characters'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'The passwords must match each other'],
    // use .select("+example") to select this field
    select: false,
    validate: {
      //! This only works on CREATE & SAVE!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  // use .select("+example") to select this field
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// ** Encrypt/hash password
userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  // Delete the confirmPassword field from the DB
  this.passwordConfirm = undefined;

  // Call the next middleware
  next();
});

userSchema.pre(/^find/, function (next) {
  // This points to the current query
  this.find({ active: true });
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; // This is to make sure that the token is created before time-stamp

  next();
});

// ** Check if passwords match
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// ** Check if the user has changed password after getting the token
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    // Check if user changed password after the token was issued
    return JWTTimestamp < changedTimeStamp;
  }

  return false;
};

// ** This is for creating a random token in order to reset password
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 600000; // +10 min from now

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
