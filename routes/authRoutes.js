const { getLogin, postLogin, getRegister, postRegister, logout } = require("../controllers/authController");

const express = require("express");
const userRouter = express.Router();

userRouter.get("/login", getLogin);

userRouter.post("/login", postLogin);

userRouter.get("/register", getRegister);

userRouter.post("/register", postRegister);

userRouter.get("/logout", logout);

module.exports = userRouter;