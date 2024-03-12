const mongoose = require('mongoose');
const validator = require('validator');

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
    minLength: [10, 'A password must have more or equal to 10 characters'],
  },
  passwordConfirm: {
    type: String,
    required: [true, 'The passwords must match each other'],
    minLength: [10, 'Please confirm your password'],
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
