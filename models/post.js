const Joi = require("joi");
Joi.ObjectId = require("joi-objectid");
const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  post: {
    type: String,
  },
  comments: {
    type: String,
  },
  likes: {
    type: Number,
    default: 0,
  },
  image: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
});

const Post = mongoose.model("Post", postSchema);

function postValidation(post) {
  const schema = Joi.object({
    post: Joi.string(),
    comments: Joi.string(),
    likes: Joi.number(),
    image: Joi.string(),
    user: Joi.ObjectId().required(),
  });
  return schema.validate(post);
}
module.exports.Post = Post;
module.exports.validate = postValidation;
