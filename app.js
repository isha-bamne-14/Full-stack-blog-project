require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const User = require("./models/User");
const userRouter = require("./routes/authRoutes");
const passportConfig = require("./config/passport");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const postRouter = require("./routes/postRoutes");
const errorHandler = require("./middlewares/errorHandler");
const commentsRouter = require("./routes/commentRoutes");
const methodOverride = require("method-override");
const userProfileRouter = require("./routes/userProfileRoutes");

const PORT = process.env.PORT || 3000;
//middlewares: 
//! for passing form data
app.use(express.urlencoded({ extended: true }));

//! session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,   
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URL
  }),
}))

//~~ method override middleware
app.use(methodOverride("_method"));

//! passport initialization
passportConfig(passport);
app.use(passport.initialize());
app.use(passport.session());

//EJS 
app.set("view engine", "ejs");

//Home route
app.get("/", (req, res) => {
  res.render("home", {
    title: "Home",
    user: req.user,
  });
});

//routes
app.use("/auth", userRouter);
app.use("/posts", postRouter);
app.use("/posts", commentsRouter);
app.use("/user", userProfileRouter);

//error handler : make sure it is after all the routes
app.use(errorHandler);

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Database Connection Failed" + err.message);
  });
