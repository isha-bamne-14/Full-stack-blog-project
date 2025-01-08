const express = require("express");
const { getPostForm, createPost, getPosts, getPost, getEditPostForm, updatePost, deletePost } = require("../controllers/postController");
const upload = require("../config/multer");
const { ensureAuthenticated } = require("../middlewares/auth");


const postRouter = express.Router();

postRouter.get("/add", getPostForm);

postRouter.post("/add", ensureAuthenticated, upload.array("images", 5), createPost);

postRouter.get("/", getPosts);

postRouter.get("/:id", getPost);

postRouter.get("/:id/edit", ensureAuthenticated, getEditPostForm);

postRouter.put("/:id/edit", ensureAuthenticated, upload.array("images", 5), updatePost);

postRouter.delete("/:id/delete", ensureAuthenticated, deletePost);

module.exports = postRouter

