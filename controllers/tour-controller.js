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

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    const queryObject = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObject[el]);
    let queryStr = JSON.stringify(queryObject);
    queryStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      let queryStr = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(queryStr);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  select() {
    if (this.queryString.fields) {
      let queryStr = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(queryStr);
    }
    return this;
  }
  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

exports.getAllTours = async (req, res) => {
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
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};


exports.gettourstats = async (req, res) => {
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
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};


exports.getMotnhlyStatus = async (req, res) => {
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
