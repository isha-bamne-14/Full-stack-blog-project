const User = require("../models/User");
const bcryptjs = require("bcryptjs");
const LocalStrategy = require("passport-local").Strategy;

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },    //req.body.email
      //this is the callback function which will get executed when a user tries to login
      async (email, password, done) => {
        console.log("Logging in user...");
        
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return done(null, false, { message: "User not found" });
                // null specifies no error, false specifies authentication failed and the last argument is the message
            }
            const isMatch = await bcryptjs.compare(password, user.password);
            if (!isMatch) {
                return done(null, false, { message: "Incorrect password" });
            }
            return done(null, user, {message : "Login successful"});
        } catch (error) {
            return done(error);
        }
      }
    )
  );

  //after successful login, info about the user is stored in the session
  //is executed when we call req.logIn()
  //Its purpose is to load the user's full details into req.user
  passport.serializeUser(function(user, done) {    
    console.log("Serializing user...");
    done(null, user._id);
  });

  //The passport.deserializeUser function is triggered on every request to an authenticated route, provided the user is logged in and a session exists. It also populates req.user
  passport.deserializeUser(async function (id, done) {
    console.log("Deserializing user...");
    
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
  });
};


