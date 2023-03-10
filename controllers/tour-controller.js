const fs = require('fs');
const Tour = require('../models/tour-model');
const AppError = require("../utilities/appError");
const APIFeatures = require("../utilities/apiFeatures")

// IO operations
const toursData = JSON.parse(
  fs.readFileSync(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    'utf-8',
    (err, data) => data
  )
);

exports.getAllTours = async (req, res, next) => {
  try {
    const api = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .select()
      .pagination();
    const tours = await api.query;
    res.status(200).json({
      status: 'success',
      data: { tours: tours },
      results: tours.length,
    });
  } catch (err) {
    next(new AppError(err,400));
  }
};


exports.gettourstats = async (req, res,next) => {
  try {
    const tourStatus = await Tour.aggregate([
      {
        $match: { ratingAverage : { $gte : 4.5} }
      },
      {
        $group: { 
          _id: "$difficulty" ,
          minPrice: { $min : "$price" },
          maxPrice: { $max : "$price" },
          numtours: { $sum : 1 },
          avgPrice: { $avg : "$price" },
          avgRating: { $avg : "$ratingAverage" },
         }
      }
    ])
    res.status(200).json({
      status: 'success',
      data: tourStatus,
    });
  } catch (err) {
    next(new AppError(err,400));
  }
};


exports.getMotnhlyStatus = async (req, res,next) => {
  try {
    const { year } = req.params
    const plan = await Tour.aggregate([
      {
        $unwind: "$startDates"
      },
      {
        $match: { startDates : {
          $gte : new Date(`${year}-01-01`),
          $lte : new Date(`${year}-12-31`)
        }}
      },
      {
        $group: { 
          _id: { $month : "$startDates" },
          numToursStarts : { $sum : 1 },
          tours: { $push : "$name" },
         },
        },
      { 
        $project: { _id : 0 }
      },
      { 
        $sort: { numToursStarts : -1 }
      }
    ])
    res.status(200).json({
      status: 'success',
      data: plan,
    });
  } catch (err) {
    next(new AppError(err,400));
  }
};

exports.addTour = async (req, res,next) => {
  try {
    const newTour = await Tour.create({ ...req.body });
    res.status(201).json({
      status: 'success',
      data: newTour,
    });
  } catch (err) {
    next(new AppError(err,400));
  }
};

exports.getTour = async (req, res,next) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if(!tour){
      next(new AppError("Tour not found with given Id",404));
      return
    }
    res.status(200).json({
      status: 'success',
      data: { tour: tour },
    });
  } catch (err) {
    next(new AppError(err,404));
  }
};

exports.updateTour = async (req, res,next) => {
  try {
    const tour = await Tour.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
      },
      { new: true }
    );

    if(!tour){
      next(new AppError("Tour not found with given Id",404));
      return
    }

    res.status(200).json({
      status: 'success',
      data: { tour: tour },
    });
  } catch (err) {
    next(new AppError(err,400));
  }
};

exports.deleteTour = async (req, res,next) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    
    if(!tour){
      next(new AppError("Tour not found with given Id",404));
      return
    }

    res.status(200).json({
      status: 'success',
      data: [],
    });
  } catch (err) {
    next(new AppError(err,400));
  }
};
