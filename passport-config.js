const LocalStrategy = require("passport-local").Strategy,
mongoose = require("mongoose"),
User = require("./models/user"),
bcrypt = require("bcrypt");

function passportInit(passport) {
    passport.use(new LocalStrategy({usernameField: "email"}, async (email, password, done) => {
        try {
            let foundUser = await User.findOne({email: email});
            if (!foundUser) {
                return done(null, false, {message: "User Doesn't Exist!"});
            }
            let match = await bcrypt.compare(password, foundUser.password);
            if (match) {
                return done(null, foundUser, {message: "Welcome, " + foundUser.name});
            } else {
                return done(null, false, {message: "Incorrect Email or Password!"});
            }
        } catch (err) {
            return done(err);
        }
    }));

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
      
    passport.deserializeUser( async function(id, done) {
        try {
            let user = await User.findById(id);
            // let user = await User.findById(id).populate("following").exec();
            done(null, user);
        } catch (error) {
            done(error);
        }
    });
}

module.exports = passportInit;