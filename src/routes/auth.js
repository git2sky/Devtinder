const express = require('express');
const { validateSignupData } = require('../utils/validateProfileData.js');
const bcrypt = require('bcrypt');
const User = require('../models/user.js');
const validator = require('validator');
const {userAuth} = require('../middlewares/userAuth.js');

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
    try {
        // validation od data at API Level
        validateSignupData(req);
        const { firstName, lastName, emailId, password, gender, age } = req.body;

        // encrption of password before storing into database is required
        const passwordHash = await bcrypt.hash(password, 10);

        const user = new User({
            firstName,
            lastName,
            emailId,
            gender,
            age,
            password: passwordHash
        });
        await user.save();
        res.send("User added successfully");
    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
});


authRouter.post("/login", async (req, res) => {
    try {
        const { emailId, password } = req.body;

        if (!validator.isEmail(emailId)) {
            throw new Error("Email is not correct");
        }

        const user = await User.findOne({ emailId: emailId });

        if (!user) {
            throw new Error("Invalid Credential!");
        }

        const isPasswordValid = await user.validatePassword(password);

        if (isPasswordValid) {
            //Get the Token
            const token = await user.getJWTToken();
            //Add the token in a cookie and send the response back
            res.cookie("token", token , {
                expires : new Date(Date.now() + 8*3600000)
            });
            res.status(200).send("Logged in successfully!");
        } else {
            throw new Error("Invalid Credential!");
        }
    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
});

// logout means expire the token in the cookie right now
authRouter.post('/logout', (req,res)=>{
    //First do all the cleanup activity the expire the cookie
    res.cookie('token', null,{
        expires : new Date(Date.now())
    });
    res.status(200).send("User logged out");
})

authRouter.post('/password', userAuth, async (req, res) => {
    try {
        const { oldpass, newpass, confirmpass } = req.body;
        const user = req.user;
        const isPasswordValid = await user.validatePassword(oldpass);
        if (!isPasswordValid) {
            throw new Error("Old Password is not correct");
        }

        if (newpass != confirmpass) {
            throw new Error("New Password and Confirm Password do not match");
        }

        if (!validator.isStrongPassword(newpass)) {
            throw new Error("New Password is not strong enough");
        }

        const passwordHash = await bcrypt.hash(newpass, 10);
        user.password = passwordHash;
        await user.save();
        res.status(200).send("Password updated successfully")
    } catch (err) {
        res.status(400).send("Error : " + err.message)
    }
})

module.exports = authRouter;