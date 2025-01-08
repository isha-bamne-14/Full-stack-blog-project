const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Post = require("../models/Post");
const File = require("../models/File");
const Cloudinary = require("../config/cloudinary");
const Comment = require("../models/Comment");

exports.getProfile = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
        return next(new Error("User not found"));
    }

    // to show newly created posts before older ones
    const posts = await Post.find({ author: user._id }).sort({ createdAt: -1 });
    console.log("User: ", user);
    

    res.render("profile", {
        title: "Profile",
        user,
        posts,
        error : null,
        postCount : posts.length
    });
});

exports.getEditProfile = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
        return next(new Error("User not found"));
    }
    res.render("editProfile", {
        title: "Edit Profile",
        user,
        error : null,
        success : null
    });
});

exports.updateProfile = asyncHandler(async (req, res, next) => {
    const { username, email, bio } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
        return next(new Error("User not found"));
    }
    user.username = username || user.username;
    user.email = email || user.email;
    user.bio = bio || user.bio;

    if (req.file) {
        if (user.profilePicture?.public_id) {
            await Cloudinary.uploader.destroy(user.profilePicture.public_id);
        }
    }

    const file = await File.create({
        url: req.file.path,
        public_id: req.file.filename,
        uploaded_by: req.user._id,
    });

    user.profilePicture = {
        url: file.url,
        public_id: file.public_id,
    };

    await user.save();
    res.render("editProfile", {
        title: "Edit Profile",
        user,
        error : null,
        success : "Profile updated successfully"
    });
});

exports.deleteProfile = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        return next(new Error("User not found"));
    }
    if (user.profilePicture?.public_id) {
        await Cloudinary.uploader.destroy(user.profilePicture.public_id);
    }
    const posts = await Post.find({ author: req.user._id });
    await Promise.all(
        posts.map(async (post) => {
            await Promise.all(
                post.images.map(async (image) => {
                    await Cloudinary.uploader.destroy(image.public_id);
                }),
                post.comments.map(async (comment) => {
                    await Comment.findByIdAndDelete(comment._id);
                })
            );
        })
    );
    await Promise.all(posts.map(async (post) => await Post.findByIdAndDelete(post._id)));
    await Comment.deleteMany({ author: req.user._id });
    await User.findByIdAndDelete(req.user._id);
    const files = await File.find({ uploaded_by: req.user._id });
    await Promise.all(
        files.map(async (file) => {
            await Cloudinary.uploader.destroy(file.public_id);
        })
    );
    await File.deleteMany({ uploaded_by: req.user._id });
    res.redirect("/auth/login");
});