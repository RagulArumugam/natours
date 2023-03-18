const mongoose = require('mongoose');
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto")

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true,"Please tell us your name!"],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail,"Entered value is not a valid email"]
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: true,
    min: [6, "value must be greater than 6 chanracdters"],
    max: [16, "value must be greater than 16 chanracdters"],
    select: false
  },
  role: {
    type: String,
    enum: ["user","guide","lead-guide","admin"],
  },
  passwordConfirm: {
    type: String,
    required: true,
    min: [6, "value must be greater than 6 chanracdters"],
    max: [16, "value must be greater than 16 chanracdters"],
    validate: {
      // works on create and save
      validator: function(el) {
        console.log(el,this);
        return el === this.password
    } , message: "Password are not the same"
  }
},
passwordChangedAt: Date,
passwordResetToken: String,
PasswordResetExpires: Date,
active: {
  type: Boolean,
  default: true,
  select: false
}
},
// to work the vistual propeties
{
  toJSON : {virtuals : true},
  toObject : {virtuals : true}
}
);


userSchema.pre("save" , async function (next) {
  //to check the passowrd is modified provided by mongo db
  if(!this.isModified("password")) return next();

  // if there is a cnage in password encrypt using bcrypt
  this.password = await bcrypt.hash(this.password , 12);
  this.passwordConfirm = undefined
  next()
})

userSchema.pre(/^find/ , async function(next){
  this.find({ active: { $ne: false }})
  next();
})

userSchema.pre("save" , async function(next){
  if(!this.isModified("password") || this.isNew ) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
})

userSchema.methods.correctPassword =async function(candidatePassword,userPassword){
  return await bcrypt.compare(candidatePassword,userPassword)
}

userSchema.methods.changedPasswordAfter =async function(JWTTimeStamp){
  if(this.passwordChangedAt) {
    const  changeTimeStamp = parseInt(this.passwordChangedAt.getTime()/1000,10)
    return JWTTimeStamp < changeTimeStamp;
  }
  return false
}

userSchema.methods.createPassowrdResetToken =async function(){
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  this.PasswordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
}


const User = mongoose.model('User', userSchema);

module.exports = User;
