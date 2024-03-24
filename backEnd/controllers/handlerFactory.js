const APIFeatures = require('../utils/apiFeatures');

// ** Functions that will work on multiply Models ↓

exports.deleteOne = (Model) => async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await Model.findByIdAndDelete(id, (err, doc) => {
      if (err) throw new Error(err);
      console.log('Deleted');
    });

    if (!doc) throw new Error('The document was not found');
    res.status(204).json({
      status: 'success',
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: `ERROR: ${err.message}`,
    });
  }
};

exports.updateOne = (Model) => async (req, res) => {
  try {
    const { id } = req.params;
    const updatedDoc = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        data: updatedDoc,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: `ERROR: ${err.message}`,
    });
  }
};

exports.createOne = (Model) => async (req, res) => {
  try {
    const newDoc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: newDoc,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: `ERROR: ${err.message}`,
    });
  }
};

exports.getOne = (Model, populateOptions) => async (req, res) => {
  let doc = undefined;
  try {
    const { id } = req.params;
    if (populateOptions) {
      doc = await Model.findById(id).populate(populateOptions);
    } else {
      doc = await Model.findById(id);
    }

    if (!doc) throw new Error('The document was not found');

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: `ERROR: ${err.message}`,
    });
  }
};

exports.getAll = (Model) => async (req, res) => {
  try {
    // * Execute query
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitField()
      .pagination();

    const doc = await features.query;

    // * Send response
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: `ERROR: ${err.message}`,
    });
  }
};

// ** Depending on which user is currently logged in (Middleware)
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  console.log('Get me');

  next();
};
