const fs = require('fs');

// * Read the sample-file | Tours
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

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
  } else {
    res.status(404).json({
      status: 'Fail',
      results: 0,
      data: {},
    });
  }
};

// *? Helper function | Tours
exports.createNewTour = (req, res) => {
  const newID = tours[tours.length - 1].id + 1;

  const newTour = Object.assign({ id: newID }, req.body);

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tours: newTour,
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

    fs.writeFile(
      `${__dirname}../dev-data/data/tours-simple.json`,
      JSON.stringify(tours),
      (err) => {
        res.status(201).json({
          status: 'success',
          data: {
            tours,
          },
        });
      }
    );
  } else {
    res.status(404).json({
      status: 'Fail',
      data: {},
    });
  }
};

// *? Helper function | Tours
exports.deleteTour = (req, res) => {
  const { id } = req.params;
  const updatedTours = tours.filter((el) => el.id !== Number(id));

  fs.writeFile(
    `${__dirname}/../backEnd/dev-data/data/tours-simple.json`,
    JSON.stringify(updatedTours),
    (err) => {
      res.status(204).json({
        status: 'success',
        data: null,
      });
    }
  );
};
