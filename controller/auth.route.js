const express = require("express");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { UserModel } = require("../model/user.model");
const jwt = require("jsonwebtoken");
const passport = require("passport");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const authRoute = express.Router();

// Google Oauth
authRoute.get(
    "/google",
    passport.authenticate("google", { scope: ["email", "profile"] })
);
authRoute.get(
    "/google/callback",
    passport.authenticate('google', {
        failureRedirect: '/auth/google/failure',
        session: false
    }),
    function (req, res) {
        let user = req.user;
        const token = jwt.sign({ userId: user._id }, process.env.secret, { expiresIn: '1hr' })

        res.redirect(`https://flexfit.onrender.com/dashboard.html?id=${user._id}&token=${token}&role=${user.role}&approved=${user.approved}&username=${user.name}`); // chnge the link to frontend
    }
);

authRoute.get("/google/failure", (req, res) => {
    res.redirect("https://flexfit.onrender.com/login.html")
})

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "https://flexfit.onrender.com/auth/google/callback", // change the callback link
            passReqToCallback: true
        },
        async function (request, accessToken, refreshToken, profile, cb) {
            let email = profile._json.email;
            let udata = await UserModel.findOne({ email });
            if (udata) {
                return cb(null, udata);
            }
            let name = profile._json.name;

            const user = new UserModel({
                name,
                email,
                pass: uuidv4(),
            });
            await user.save();
            return cb(null, user);
        }
    )
);