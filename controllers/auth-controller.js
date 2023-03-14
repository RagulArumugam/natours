const { promisify } = require("util");
const AppError = require("../utilities/appError");
const User = require("../models/user-modal");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


const signInToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET , {expiresIn: process.env.JWT_EXPIRES_IN});
}

exports.signup = async (req,res,next) => {
  try{
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: req.body.role,
    })

    const token = signInToken(user._id)

    res.status(201).json({
      status: 'success',
      token,
      data: {user},
    });
  }
  catch(err) {
    next(new AppError(err,404))
  }
}

exports.login = async (req,res,next) => {
  try{
    const { email , password } = {...req.body}
    
    console.log(email,password)

    // email and password exist 
    if(!email || !password){
      return next(new AppError("please provide the email and password",400));
    }
    // user exist and password is correct
    const user = await User.findOne({email}).select("+password");
    const correct = await user.correctPassword(String(password) , user.password);
    if(!user || !correct){
      return next(new AppError("Incorrect email or password",401));
    }

    //generate token
    const token = signInToken(user._id)

    res.status(201).json({
      status: 'success',
      token,
      data: {user},
    });
  }
  catch(err) {
    next(new AppError(err,404))
  }
}

exports.protect = async(req,res,next) => {
  try{
    let token
    //1 get the token and chekc if its there
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1]
    }
    if(!token){
    return next(new AppError("You are not logged in, please login to access",401))
    }
    //2 validating the token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    
    //3 if the user exist
    const user = await User.findById(decoded.id)

    if(!user){
      return next(new AppError("User not found",401))
    }
    
    //4 if the usr changed password after the token was issued
    // if(user.changedPasswordAfter(decoded.iat)){
    //   return next(new AppError("User recently changes password please login again",401))
    // }

    console.log("protect",user);
    req.user = user;

    next()
  }
  catch(err) {
    next(new AppError(err,404))
  }
}


// for user roles
exports.restrictTo = (...roles) => {
  return async (req,res,next) => {
    try{
      console.log(req.user.role)
      if(!roles.includes(req.user.role)){
        return next(new AppError("You do not have permission to perform this action",403))
      }

      res.status(200).json({
        message: "success"
      })
      // next()
    } catch(err) {
      next(new AppError(err,404))
    }
} 
}