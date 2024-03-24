const User = require('./../models/userModel');
const { deleteOne, getOne, getAll, createOne } = require('./handlerFactory');

// ** Upload image ↓
const multer = require('multer');
const sharp = require('sharp'); // *! Use version 0.32.6

// const multerStorage = multer.diskStorage({
//   destination: (req, file, callbackFn) => {
//     callbackFn(null, 'public/img/users');
//   },
//   filename: (req, file, callbackFn) => {
//     const extension = file.mimetype.split('/')[1];
//     callbackFn(null, `user-${req.user.id}-${Date.now()}.${extension}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, callbackFn) => {
  if (file.mimetype.startsWith('image')) {
    callbackFn(null, true);
  } else {
    callbackFn(new Error('Not an image, please upload an image'), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhot = async (req, res, next) => {
  if (!req.file) return next();

  // Create a random and unique name for the phot
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  // Use sharp package to resize the image if necessary in order to save space,
  // then save the image toFile... with the quality of 90%
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};

// * Read the sample-file | Users
// const users = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/users.json`)
// );

// *? Helper function | Filter req.body
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

// *? Helper function | Fetch all users
exports.getAllUsers = getAll(User);
// exports.getAllUsers = async (req, res) => {
//   try {
//     const users = await User.find();

//     res.status(200).json({
//       status: 'success',
//       results: users.length,
//       data: {
//         users,
//       },
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: 'fail',
//       message: `ERROR: ${err.message}`,
//     });
//   }
// };

// *? Helper function | Fetch user
exports.getUser = getOne(User);
// exports.getUser = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const user = await User.findById(id);

//     if (!user) throw new Error('The user was not found');

//     res.status(200).json({
//       status: 'success',
//       results: 1,
//       data: {
//         user,
//       },
//     });
//   } catch (err) {
//     res.status(401).json({
//       status: 'fail',
//       message: `ERROR: ${err.message}`,
//     });
//   }
// };

// *? Helper function | Users
// exports.createUser = async (req, res) => {
//   try {
//     console.log(req.body);
//     await User.create(req.body);

//     res.status(201).json({
//       status: 'success',
//     });
//   } catch (err) {
//     res.status(401).json({
//       status: 'fail',
//       message: `ERROR: ${err.message}`,
//     });
//   }
// };

// *? Helper function | Users
// exports.updateUser = (req, res) => {
//   const { id } = req.params;

//   const userIndex = users.findIndex((el) => el._id === id);

//   users[userIndex] = { ...users[userIndex], ...req.body };

//   fs.writeFile(
//     `${__dirname}../dev-data/data/users.json`,
//     JSON.stringify(users),
//     (err) => {
//       res.status(202).json({
//         status: 'success',
//         data: null,
//       });
//     }
//   );
// };

// *? Helper function | Delete user
exports.deleteUser = deleteOne(User);
// exports.deleteUser = async (req, res, next) => {
//   try {
//     await User.findByIdAndUpdate(req.user.id, { active: false });

//     res.status(204).json({
//       status: 'success',
//       data: null,
//     });
//   } catch (err) {
//     res.status(401).json({
//       status: 'fail',
//       message: `ERROR: ${err.message}`,
//     });
//   }
// };
// *? Helper function | Update user
exports.updateMe = async (req, res, next) => {
  try {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm)
      throw new Error(
        'This route is not for password updates. Please use /updateMyPassword route'
      );

    // 2) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email');
    // Adding image to the user
    if (req.file) filteredBody.photo = req.file.filename;

    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      message: `ERROR: ${err.message}`,
    });
  }
};

exports.createUserByAdmin = createOne(User);
