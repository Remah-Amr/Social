const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const mongoose = require("mongoose");

const postSchema = mongoose.Schema(
  {
    postText: {
      type: String,
    },
    // [TODO] : Array of objects => [ { content : String } , { image : String }]
    comments: {
      type: String,
    },
    // [TODO] : Array of values => [ { type: mongoose.Schema.Types.ObjectId , ref: "User" } ]
    // [TODO] : rename to likeIds , we get numberOfLikes from the length of that array 
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
    comments: Joi.string(), // [TODO] : remove constraint
    likes: Joi.number(), // [TODO] : remove constraint
    image: Joi.string(),
    userId: Joi.objectId().required(),
  });
  return schema.validate(post);
}
module.exports.Post = Post;
module.exports.validate = postValidation;
