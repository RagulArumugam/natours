const AppError = require("../utilities/appError");
const User = require("../models/user-modal")

exports.signup = async (req,res,next) => {
  console.log("entering");
  try{
    const user = await User.create(req.body)
    res.status(201).json({
      status: 'success',
      data: {user},
    });
  }
  catch(err) {
    next(new AppError(err,404))
  }
}

// exports.login = async (req,res,next) => {
//   try{
//     const user = User.create(req.body).select("name email")
//     res.status(201).json({
//       status: 'success',
//       data: {user},
//     });
//   }
//   catch(err) {
//     next(new APIError(err,404))
//   }
// }