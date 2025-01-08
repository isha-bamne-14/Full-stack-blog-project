const asyncHandler = require("express-async-handler");
const bcryptjs = require("bcryptjs");
const passport = require("passport");
const User = require("../models/User");

exports.getLogin = asyncHandler((req, res) => {
  res.render("login", {
    title: "Login",
    user: req.user,
    error: null,
  });
});

exports.postLogin = asyncHandler(async (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    } 
    if (!user) {
      //user not found
      return res.render("login", {
        title: "Login",
        user: req.user,
        error: info.message,
      });
    }
    console.log(req.user);
    
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      //console.log("Req.user = " + req.user);
      
      return res.redirect("/user/profile");
    });
  })(req, res, next);
});

exports.getRegister = asyncHandler((req, res) => {
  res.render("register", {
    title: "Register",
    user: req.user,
    error: null,
  });
});

exports.postRegister = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  try {
    //check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("register", {
        title: "Register",
        user: req.user,
        error: "User already exists",
      });
    }
    const hashedPassword = await bcryptjs.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    res.redirect("/auth/login");
  } catch (err) {
    res.render("register", {
      title: "Register",
      user: req.user,
      error: err.message,
    });
  }
});

exports.logout = asyncHandler((req, res) => {
  req.logout((err) => {        // req.logout is available due to passport.js
    if (err) {
      return next(err);
    }
    req.session.destroy((err) => {
      if (err) {
        console.error("Failed to destroy session:", err);
        return res.status(500).send({ message: "Session destruction failed" });
      }
      // Clear the cookie
      res.clearCookie("connect.sid"); // Use your session cookie name here
      return res.redirect("/auth/login");
    });
  });
});
