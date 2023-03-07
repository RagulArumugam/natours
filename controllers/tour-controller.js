const fs = require('fs');

// IO operations
const toursData = JSON.parse(
  fs.readFileSync(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    'utf-8',
    (err, data) => data
  )
);

exports.checkId = (req, res, next, value) => {
  const tour = toursData.find((item) => item.id === req.params.id * 1);
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid Id',
    });
  }
  next();
};

exports.checkValidTourBody = (req, res, next, value) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'invalid Body',
    });
  }
  next();
};

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: { toursData: toursData },
    results: toursData.length,
  });
};

exports.addTour = (req, res) => {
  const newTour = Object.assign({ id: toursData.length + 1 }, req.body);
  console.log(newTour);
  toursData.push(newTour);
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(toursData),
    (err) => {
      if (!err) {
        res.status(201).json({
          status: 'success',
          data: newTour,
        });
      }
    }
  );
};

exports.getTour = (req, res) => {
  const tour = toursData.find((item) => item.id === req.params.id * 1);
  res.status(200).json({
    status: 'success',
    data: { data: tour },
  });
};

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: 'Tour updated',
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: 'Tour Deleted',
  });
};
