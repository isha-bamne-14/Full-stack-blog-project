const asyncHandler = require("express-async-handler");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

exports.addComment = asyncHandler(async (req, res, next) => {
    const { content } = req.body;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
        return next(new Error("Post not found"));
    }
    const newComment = await Comment.create({
        content,
        post: postId,
        author: req.user._id,
    });
    
    
    post.comments.push(newComment._id);
    await post.save();
    // console.log(post);
    
    res.redirect(`/posts/${postId}`);
});

exports.getCommentEdit = asyncHandler(async (req, res, next) => {
    const post = await Post.findById(req.params.id);
    const commentId = req.params.commentId;
    const comment = await Comment.findById(commentId);
    if (!comment) {
        return next(new Error("Comment not found"));
    }
    if (comment.author.toString() !== req.user._id.toString()) {
        return next(new Error("You are not authorized to edit this comment"));
    }
    res.render("editComment", {
        title: "Edit Comment",
        user: req.user,
        comment,
        error: null,
        success: null,
        post
    });
});

exports.editComment = asyncHandler(async (req, res, next) => {
    const { content } = req.body;
    const commentId = req.params.commentId;
    const comment = await Comment.findById(commentId);
    if (!comment) {
        return next(new Error("Comment not found"));
    }
    comment.content = content;
    await comment.save();
    res.redirect(`/posts/${comment.post}`);
});

exports.deleteComment = asyncHandler(async (req, res, next) => {
    const commentId = req.params.commentId;
    const comment = await Comment.findById(commentId);
    if (!comment) {
        return next(new Error("Comment not found"));
    }
    if (comment.author.toString() !== req.user._id.toString()) {
        return next(new Error("You are not authorized to delete this comment"));
    }
    await Comment.findByIdAndDelete(commentId);
    res.redirect(`/posts/${comment.post}`);
});