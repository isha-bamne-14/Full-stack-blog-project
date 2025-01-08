const asyncHandler = require("express-async-handler");
const File = require("../models/File");
const Post = require("../models/Post");
const Cloudinary = require("../config/cloudinary");

exports.getPostForm = asyncHandler((req, res) => {
  res.render("newPost", {
    title: "Add A New Post",
    user: req.user,
    error: null,
    success: null,
    post : null
  });
});

exports.createPost = asyncHandler(async (req, res) => {
  const { title, content } = req.body;

  const images = await Promise.all(
    req.files.map(async (file) => {
      const newFile = new File({
        url: file.path,
        public_id: file.filename,
        uploaded_by: req.user._id,
      });
      await newFile.save();
      return {
        url: newFile.url,
        public_id: newFile.public_id,
      };
    })
  );

  const newPost = await Post.create({
    title,
    content,
    author: req.user._id,
    images,
  });

  req.user.posts.push(newPost._id);
  await req.user.save();

  res.render("newPost", {
    title: "Add Post",
    user: req.user,
    error: null,
    success: "Post created successfully",
  });
});

//Get all posts
exports.getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find().populate("author", "username");
  // console.log(posts[0]);

  res.render("posts", {
    title: "Posts",
    user: req.user,
    posts,
    success: null,
    error: null,
  });
});

//Get post by id
exports.getPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate("author", "username")
    .populate({
      path: "comments",
      populate: {
        path: "author",
        select: "username",
      }
    });
  console.log(post);

  res.render("post", {
    title: post.title,
    user: req.user,
    post,
    success: null,
    error: null,
  });
});

exports.getEditPostForm = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  res.render("editPost", {
    title: "Edit Post",
    user: req.user,
    post,
    error: null,
    success: null,
  });
});

//update post
exports.updatePost = asyncHandler(async (req, res, next) => {
  const {title, content} = req.body;
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new Error("Post not found"));
  }
  if (post.author.toString() !== req.user._id.toString()) {
    return next(new Error("You are not authorized to update this post"));
  }

  post.title = title || post.title;
  post.content = content || post.content;
  if (req.files) {
    await Promise.all(
      post.images.map(async (image) => {
        await Cloudinary.uploader.destroy(image.public_id);
      })
    );

    const images = await Promise.all(
      req.files.map(async (file) => {
        const newFile = new File({
          url: file.path,
          public_id: file.filename,
          uploaded_by: req.user._id,
        });
        await newFile.save();
        return {
          url: newFile.url,
          public_id: newFile.public_id,
        };
      })
    );
    post.images = images;
  }
  await post.save();
  res.redirect(`/posts/${post._id}`);
});

exports.deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new Error("Post not found"));
  }
  if (post.author.toString() !== req.user._id.toString()) {
    return next(new Error("You are not authorized to delete this post"));
  }
  await Promise.all(
    post.images.map(async (image) => {
      await Cloudinary.uploader.destroy(image.public_id);
    })
  );
  await Post.findByIdAndDelete(req.params.id);
  res.redirect("/posts");
});
