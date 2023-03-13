const AppError = require("../utilities/appError");
const User = require("../models/user-modal")


exports.getAllUser = async(req, res , next) => {
  try{
    const allUsers = await User.find()
    res.status(201).json({
      status: 'success',
      data: {users: allUsers},
    });
  }
  catch(err) {
    next(new AppError(err,404))
  }
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this is not yet defined',
  });
};

exports.getUser = async (req, res, next) => {
  try{
    const user = await User.findById(req.params.id)
    res.status(200).json({
      status: 'success',
      data: {user: user},
    });
  }
  catch(err) {
    next(new AppError(err,404))
  }
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this is not yet defined',
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this is not yet defined',
  });
};
