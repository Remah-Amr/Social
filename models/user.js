const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const config = require("config");
// const bcrypt = require("bcrypt");
// const crypto = require("crypto");
const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    // [TODO] remove this attribute , we already store user attribute in post model
    posts: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
    // [TODO] : Array of values => [ { type: mongoose.Schema.Types.ObjectId , ref: "User" } ]
    // [TODO] : rename to likeIds , we get numberOfFollowers from the length of that array
    followers: {
      type: Number,
      default: 0,
    },
    // [TODO] : Same As followers
    following: {
      type: Number,
      default: 0,
    },
    // resetPasswordToken: {
    //   type: String,
    //   required: false,
    // },
    // resetPasswordExpires: {
    //   type: Date,
    //   required: false,
    // },
  },
  { timestamps: true }
);

function rigesterValidation(user) {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    posts: Joi.objectId(), // [TODO] : remove 
    image: Joi.string(),
  });
  return schema.validate(user);
}

function logValidation(user) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });
  return schema.validate(user);
}

// userSchema.pre("save", function (next) {
//   const user = this;

//   if (!user.isModified("password")) return next();

//   bcrypt.genSalt(10, function (err, salt) {
//     if (err) return next(err);

//     bcrypt.hash(user.password, salt, function (err, hash) {
//       if (err) return next(err);

//       user.password = hash;
//       next();
//     });
//   });
// });

// userSchema.methods.comparePassword = function (password) {
//   return bcrypt.compareSync(password, this.password);
// };

// userSchema.methods.generateJWT = function () {
//   const today = new Date();
//   const expirationDate = new Date(today);
//   expirationDate.setDate(today.getDate() + 60);

//   let payload = {
//     id: this._id,
//     email: this.email,
//     name: this.name,
//   };

//   return jwt.sign(payload, config.get("SENDGRID_API_KEY"), {
//     expiresIn: parseInt(expirationDate.getTime() / 1000, 10),
//   });
// };

// userSchema.methods.generatePasswordReset = function () {
//   this.resetPasswordToken = crypto.randomBytes(20).toString("hex");
//   this.resetPasswordExpires = Date.now() + 3600000; //expires in an hour
// };

// mongoose.set("useFindAndModify", false);
const User = mongoose.model("User", userSchema);

module.exports.User = User;
module.exports.register = rigesterValidation;
module.exports.log = logValidation;
