const express = require("express");
const upload = require("../config/multer");
const { getProfile, getEditProfile, updateProfile, deleteProfile } = require("../controllers/userController");
const { ensureAuthenticated } = require("../middlewares/auth");
const userProfileRouter = express.Router();

userProfileRouter.get("/profile", ensureAuthenticated, getProfile);

userProfileRouter.get("/edit", ensureAuthenticated, getEditProfile);

userProfileRouter.post("/edit", ensureAuthenticated, upload.single("profilePicture"), updateProfile);

userProfileRouter.delete("/delete", ensureAuthenticated, deleteProfile);

module.exports = userProfileRouter;