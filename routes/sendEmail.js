const sgMail = require("@sendgrid/mail");
const config = require("config");
const { User } = require("../models/user");

sgMail.setApiKey(config.get("SENDGRID_API_KEY"));

module.exports = async function (userEmail) {
  const user = await User.find(userEmail);
  if (!user)
    return res.status(401).send("Their is no user with the given email ");
  try {
    user.generatePasswordReset();
    await user.save();
    let link =
      "http://" +
      req.headers.host +
      "/api/auth/reset/" +
      user.resetPasswordToken;
    const mailOptions = {
      to: user.email,
      from: "Social@gmail.com",
      subject: "Password change request",
      text: `Hi ${user.name} \n 
                    Please click on the following link ${link} to reset your password. \n\n 
                    If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    sgMail.send(mailOptions, (error, result) => {
      if (error) return res.status(500).json({ message: error.message });

      res.status(200).send(`A reset email has been sent to ${user.email}.`);
    });
  } catch (error) {
    res.status(500).send(error);
  }
};
