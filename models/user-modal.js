const mongoose = require('mongoose');
const validator = require("validator");
const bcrypt = require("bcryptjs")

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
  },
  passwordConfirm: {
    type: String,
    required: true,
    min: [6, "value must be greater than 6 chanracdters"],
    max: [16, "value must be greater than 16 chanracdters"],
    validate: {
      // works on create and save
      validator: function(el) {
        return el === this.password
    } , message: "Password are not the same"
  }
  },
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


const User = mongoose.model('User', userSchema);

module.exports = User;
