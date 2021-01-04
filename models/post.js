const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const mongoose = require("mongoose");

const postSchema = mongoose.Schema(
  {
    postText: {
      type: String,
    },
    comments: {
      type: String,
    },
    likes: {
      type: Number,
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      default: 0,
    },
    image: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

function postValidation(post) {
  const schema = Joi.object({
    postText: Joi.string().required(),
    comments: Joi.string(),
    likes: Joi.number(),
    image: Joi.string(),
    userId: Joi.objectId().required(),
  });
  return schema.validate(post);
}
module.exports.Post = Post;
module.exports.validate = postValidation;
