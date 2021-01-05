const { User, register, log } = require("../models/user");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");
const cloud = require("../cloudinary");
const multer = require("../middleware/multer");
const fs = require("fs");
const auth = require("../middleware/auth");
const router = express.Router();

router.get("/", async (req, res, next) => {
  const user = await User.find().select("-password -__v");
  res.status(200).send(user);
});

router.get("/me", auth, async (req, res, next) => {
  const user = await User.findById(req.user._id).select("-password");
  res.status(200).send(user);
});
router.get("/:id", async (req, res, next) => {
  const user = await User.findById(req.params.id).select("-password -__v");
  if (!user) return res.status(404).send("No User found with the given ID");

  res.status(200).send(user);
});

router.post("/register", multer, async (req, res, next) => {
  const { error } = register(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User exists");

  const img = await cloud.cloudUpload(req.file.path);
  if (!img) return res.status(500).send("Error while uploading");

  user = new User({
    name: req.body.name,
    email: req.body.email,
    password: await bcrypt.hash(req.body.password, 10),
    image: img.image,
  });

  try {
    await user.save();
    fs.unlinkSync(req.file.path);
    res.status(201).send(user);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.post("/login", async (req, res, next) => {
  const { error } = log(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password");

  const compare = await bcrypt.compare(req.body.password, user.password);
  if (!compare) return res.status(400).send("Invalid email or password");

  const token = jwt.sign(
    {
      _id: user.id,
      email: user.email,
    },
    config.get("jwtprivateKey")
  );
  res
    .status(200)
    .header("auth-token", token)
    .json({ User: user, Token: token });
});

// router.post("/reset-password", async (req, res, next) => {
//   sendingEmail(req.body.email);
//   let user = User.findOne({
//     resetPasswordToken: req.params.token,
//     resetPasswordExpires: { $gt: Date.now() },
//   });

//   if (!user)
//     return res
//       .status(401)
//       .send("Password reset token is invalid or has expired.");zwt

//   try {
//     user.password = req.body.password;
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpires = undefined;
//     await user.save();
//     const mailOptions = {
//       to: user.email,
//       from: "Social@gmail.com",
//       subject: "Your password has been changed",
//       text: `Hi ${user.name} \n
//                     This is a confirmation that the password for your account ${user.email} has just been changed.\n`,
//     };
//     sgMail.send(mailOptions, (error, result) => {
//       if (error) return res.status(500).json({ message: error.message });

//       res.status(200).json({ message: "Your password has been updated." });
//     });
//   } catch (error) {
//     res.status(500).send(error);
//   }
// });

router.put("/:id", auth, multer, async (req, res, next) => {
  let user = await User.findById(req.params.id);

  // [TODO] : Add validation layer only author of profile can update it
  // if(req.user._id !==  req.params.id) return 403

  const img = await cloud.cloudUpload(req.file.path);
  if (!img) return res.status(500).send("Error while uploading");

  user.name = req.body.name;
  user.email = req.body.email;
  user.password = await bcrypt.hash(req.body.password, 10);
  user.image = img.image;
  user = await user.save();
  res.send(user);
});

router.delete("/:id", auth, async (req, res, next) => {

  const user = await User.findByIdAndRemove(req.params.id);
  if (!user) return res.status(404).send("User with given ID not found");

  res.send(user);
});

// [TODO] : End point for change password 
// [TODO] : End point for reset password 



module.exports = router;
