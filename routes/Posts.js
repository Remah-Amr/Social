const express = require("express");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer");
const cloud = require("../cloudinary");
const fs = require("fs");
const { User } = require("../models/user");
const { Post, validate } = require("../models/post");

const router = express.Router();

router.get("/", async (req, res, next) => {
  const posts = await Post.find({}).populate("user").select(" -__v");
  res.status(200).send(posts);
});

router.post("/", auth, multer, async (req, res, next) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const img = await cloud.cloudUpload(req.file.path);
  if (!img) return res.status(500).send("Error while uploading");

  const post = new Post({
    postText: req.body.postText,
    image: img.image,
    user: req.body.userId, // [TODO] user: req.user._id
  });

  try {
    await post.save();
    fs.unlinkSync(req.file.path);
    res.status(201).send(post);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.put("/:id", auth, multer, async (req, res, next) => {
  let post = await Post.findById(req.params.id);
  if (!post) return res.status(404).send("Post not found");

  // [TODO] add validation layer which only the author who can update his post 
  // if(post.user !== req.user_.id) return 403

  const img = await cloud.cloudUpload(req.file.path);
  if (!img) return res.status(500).send("Error while uploading");

  post.postText = req.body.postText;
  post.image = img.image;

  try {
    await post.save();
    fs.unlinkSync(req.file.path);
    res.status(200).send(post);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.get("/:id", async (req, res, next) => {
  const post = await Post.findById(req.params.id)
    .populate("user")
    .select("-__v");
  if (!post) return res.status(404).send("cannot find post");

  res.status(200).send(post);
});
router.delete("/:id", auth, async (req, res, next) => {
  // [TODO] find only post first without remove step , check if authorize to remove , then remove
  // const post = await Post.findById(req.params.id);
  // if (!post) return res.send("Post is already not exist"); 
  // if(post.user !== req.user._id) return 403
  // await post.delete()
  const post = await Post.findByIdAndRemove(req.params.id);
  if (!post) return res.send("Post is already not exist");

  res.status(204).send(post);
});


// [TODO] : 3 end points for add comment on post , update , delete  
// [TODO] : end point for add like on post 
// [TODO] : end point user to user follow

module.exports = router;
