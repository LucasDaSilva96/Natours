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
  photo: String,
  password: {
    type: String,
    required: [true, 'Enter a valid password'],
    minLength: [8, 'A password must have more or equal to 10 characters'],
  },
  passwordConfirm: {
    type: String,
    required: [true, 'The passwords must match each other'],
    validate: {
      //! This only works on CREATE & SAVE!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same',
    },
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

const User = mongoose.model('User', userSchema);

module.exports = User;
