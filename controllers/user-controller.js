const AppError = require("../utilities/appError");
const User = require("../models/user-modal")

const filterObj = (obj, ...allowedFields) => {
  let newObj = {};
  Object.keys(obj).forEach((el) => {
    if(allowedFields.includes(el)){
      newObj[el] = obj[el]
    }
  })
  return newObj
}

exports.getAllUser = async(req, res , next) => {
  try{
    const allUsers = await User.find().select({ active: { nte : false } })
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

exports.updateMe = async (req, res , next) => {
  try{
    console.log(req.user , req.body , req.body , req.body.passowrdConfirm)
    // 1 - error if user tries to update password
    if(req.body.password || req.body.passowrdConfirm ){
      return next(new AppError("This route is not for updating the password, please try update password",400));
    }
    //filtered the req body
    let filteredBody = filterObj(req.body, "name" , "email");
    // 3 - update user document
    const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody , {new: true , runValidators:true})

    res.status(200).json({
      status: 'success',
      user: updatedUser,
    });
  } catch(err) {
    next(new AppError(err,404))
  }
};

exports.deleteMe = async (req, res , next) => {
  try{
    // 3 - update user document
    const updatedUser = await User.findByIdAndUpdate(req.user._id, {active: false})

    res.status(204).json({
      status: 'success',
    });
  } catch(err) {
    next(new AppError(err,404))
  }
};
