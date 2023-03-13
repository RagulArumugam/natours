const AppError = require("../utilities/appError");
const User = require("../models/user-modal");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs")


const signInToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET , {expiresIn: process.env.JWT_EXPIRES_IN});
}

exports.signup = async (req,res,next) => {
  console.log("entering");
  try{
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
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
    
    // email and password exist 
    if(!email || !password){
      return next(new AppError("please provide the email and password",400));
    }
    // user exist and password is correct
    const user = await User.findOne({email}).select("+password");
    console.log("user",user,password);
    const correct = await bcrypt.compare(password , user.password);
    console.log("user",user);
    if(!user || !correct){
      return next(new AppError("Incorrect email or password",401));
    }
    console.log(user);
    //if okat send the token to client
    const token = signInToken(user._id)

    res.status(201).json({
      status: 'success',
      token,
      data: {user},
    });
  }
  catch(err) {
    next(new APIError(err,404))
  }
}