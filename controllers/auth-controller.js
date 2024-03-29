const { promisify } = require("util");
const AppError = require("../utilities/appError");
const sendEmail = require("../utilities/email");
const User = require("../models/user-modal");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto")


const signInToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET , {expiresIn: process.env.JWT_EXPIRES_IN});
}

const createAndSendTokenRes = (user,res) => {
  const token = signInToken(user._id)
    const cookieOptions = {
      expires: new Date(Date.now() + process.env.JWT_COOKIES_EXPIRES_IN * 24 * 60 * 60 * 1000),
      // secure: true,
      httpOnly: true,
    }

    //remove the password from the user
    user.password = undefined
    // if(process.env.NODE_ENV === "production") cookieOptions.secure = true
    res.cookie("jwt",token, cookieOptions)
    res.status(201).json({
      status: 'success',
      token,
      data: {user},
    });
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

    createAndSendTokenRes(user,res)
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
    createAndSendTokenRes(user,res)
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

exports.forgotPassowrd =async (req,res,next) => {
//get user by email
try{
  const user = await User.findOne({ email: req.body.email })
  if(!user){
    return next(new AppError("User not found",404))
  }
  // generate the token
  const resetToken =await user.createPassowrdResetToken()
  console.log(resetToken)
  // save the data without validation
  await user.save({validateBeforeSave: false})
  
  //send it back to users email
  const restURL  = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`

  try{
    await sendEmail({
      email: user.email,
      subject: "your passowrd reset Token (available for 10 mins)",
      message: `please use this link to reset your password ${restURL}`
    })
  } catch(err) {
    user.passwordResetToken = undefined,
    user.PasswordResetExpires = undefined
    await user.save({validateBeforeSave: false})
    return next(new AppError(err+"there was error in sending email please try again after sometime",500))
  }

  res.status(200).json({
    status: "success",
    message: "Token sent successfully",
  })
}
catch(err) {
  next(new AppError(err,400))
}
}


exports.resetPassowrd = async (req,res,next) => {
  //get user based on token
  try{
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex")
    const user = await User.findOne({ passwordResetToken: hashedToken , PasswordResetExpires: {$gte : Date.now() } });


    if(!user){
      return next(new AppError("User not found or token got expired",400))
    }

    //set the new passowrd if the tocke not expired
    //update changedPassword
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined,
    user.PasswordResetExpires = undefined
    await user.save();

    //Log the user in
    createAndSendTokenRes(user,res)

  }
  catch(err) {
    next(new AppError(err,400))
  }
}


exports.updatePassword = async (req,res,next) => {
  //get user based on token
  try{
    // check for the token and get the id
    const user = await User.findById(req.user.id).select("+password");

    if(!user) {
      return next(new AppError("User not found or token got expired",400))
    }

    console.log(user)
    let passwordChecking = await user.correctPassword(String(req.body.currentPassword), user.password);

    if(!passwordChecking) {
      return next(new AppError("your current password is wrong",400))
    }

    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm;

    await user.save();

    const token = signInToken(user._id)

    res.status(200).json({
      status: "success",
      message: "password updated successfully",
      data: user,
      token
    })
    //change the password and other parameters
  }
  catch(err) {
    next(new AppError(err,400))
  }
}