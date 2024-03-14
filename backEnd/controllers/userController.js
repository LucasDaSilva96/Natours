const fs = require('fs');
const User = require('./../models/userModel');
const APIFeatures = require('../utils/apiFeatures');

// * Read the sample-file | Users
// const users = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/users.json`)
// );

// *? Helper function | Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: `ERROR: ${err.message}`,
    });
  }
};

// *? Helper function | Users
exports.getUser = (req, res) => {
  const { id } = req.params;

  const user = users.find((el) => el._id === id);

  res.status(200).json({
    status: 'success',
    results: 1,
    data: {
      user,
    },
  });
};

// *? Helper function | Users
exports.createUser = (req, res) => {
  // TODO check if the user already exist
  const newID = String(users.length + 1);

  const newUser = Object.assign({ _id: newID }, req.body);
  users.push(newUser);

  fs.writeFile(
    `${__dirname}../dev-data/data/users.json`,
    JSON.stringify(users),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: undefined,
      });
    }
  );
};

// *? Helper function | Users
exports.updateUser = (req, res) => {
  const { id } = req.params;

  const userIndex = users.findIndex((el) => el._id === id);

  users[userIndex] = { ...users[userIndex], ...req.body };

  fs.writeFile(
    `${__dirname}../dev-data/data/users.json`,
    JSON.stringify(users),
    (err) => {
      res.status(202).json({
        status: 'success',
        data: null,
      });
    }
  );
};

// *? Helper function | Users
exports.deleteUser = (req, res) => {
  const { id } = req.params;

  const updatedUsers = users.filter((el) => el._id !== id);

  fs.writeFile(
    `${__dirname}/dev-data/data/users.json`,
    JSON.stringify(updatedUsers),
    (err) => {
      res.status(202).json({
        status: 'success',
        data: null,
      });
    }
  );
};
