const express = require("express");

const { ensureAuthenticated } = require("../middlewares/auth");
const { addComment, editComment, getCommentEdit, deleteComment } = require("../controllers/commentController");


const commentsRouter = express.Router();

commentsRouter.post("/:id/comment", ensureAuthenticated, addComment);

commentsRouter.get("/:id/comment/:commentId/edit", ensureAuthenticated, getCommentEdit);

commentsRouter.put("/:id/comment/:commentId/edit", ensureAuthenticated, editComment);

commentsRouter.delete("/:id/comment/:commentId/delete", ensureAuthenticated, deleteComment);

module.exports = commentsRouter;

