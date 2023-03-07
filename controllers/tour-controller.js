const fs = require('fs');
const Tour = require('../models/tour-model');

// IO operations
const toursData = JSON.parse(
  fs.readFileSync(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    'utf-8',
    (err, data) => data
  )
);

exports.getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find();
    res.status(200).json({
      status: 'success',
      data: { tours: tours },
      results: tours.length,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.addTour = async (req, res) => {
  try {
    const newTour = await Tour.create({ ...req.body });
    res.status(201).json({
      status: 'success',
      data: newTour,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data set',
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: { tour: tour },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
      },
      { new: true }
    );
    res.status(200).json({
      status: 'success',
      data: { tour: tour },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: 'success',
      data: [],
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
