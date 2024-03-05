const fs = require('fs');

// * Read the sample-file | Tours
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

// *? Helper function | Tours - Middleware
// request, response, next, value(id↓)
exports.checkID = (req, res, next, val) => {
  if (Number(val) > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  next();
};

// *? Helper function | Tours - Middleware
exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price',
    });
  }
  next();
};

// *? Helper function | Tours
exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours,
    },
  });
};

// *? Helper function | Tours
exports.getSpecificTour = (req, res) => {
  const { id } = req.params;
  const tour = tours.find((el) => el.id === Number(id));
  if (tour) {
    res.status(200).json({
      status: 'success',
      results: 1,
      data: {
        tour,
      },
    });
  }
};

// *? Helper function | Tours
exports.createNewTour = (req, res) => {
  const newID = tours[tours.length - 1].id + 1;

  const newTour = Object.assign({ id: newID }, req.body);

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      if (err)
        return res.status(401).json({
          status: 'fail',
          message: 'Failed to write file',
        });
      res.status(201).json({
        status: 'success',
        data: {
          tours,
        },
      });
    }
  );
};

// *? Helper function | Tours
exports.updateTour = (req, res) => {
  const { id } = req.params;
  const indexOfTour = tours.findIndex((el) => el.id === Number(id));

  if (indexOfTour >= 0) {
    tours[indexOfTour] = { ...tours[indexOfTour], ...req.body };

    fs.writeFile(``, JSON.stringify(tours), (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tours,
        },
      });
    });
  } else {
    res.status(404).json({
      status: 'fail',
      data: {},
    });
  }
};

// *? Helper function | Tours
exports.deleteTour = (req, res) => {
  const { id } = req.params;
  const updatedTours = tours.filter((el) => el.id !== Number(id));

  fs.writeFile(
    `${__dirname}./dev-data/data/tours-simple.json`,
    JSON.stringify(updatedTours),
    (err) => {
      res.status(204).json({
        status: 'success',
        data: null,
      });
    }
  );
};
