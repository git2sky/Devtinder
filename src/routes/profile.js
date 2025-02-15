const express = require('express');
const profileRouter = express.Router();
const {userAuth} = require('../middlewares/userAuth.js');
const { validateProfileEditData } = require('../utils/validateProfileData.js');


profileRouter.get("/profile/view", userAuth, async (req, res) => {
    try {
        const user = req.user;
        res.send(user);
    } catch (err) {
        res.status(400).send("Error " + err.message)
    }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
    try {
        if(!validateProfileEditData(req)){
           throw new Error('Email and password is not allowed to edit')
        }

        const loggedInUser = req.user;
        Object.keys(req.body).forEach(key => loggedInUser[key] = req.body[key]);
        await loggedInUser.save();
        res.send(`${loggedInUser.firstName}, yours profile has been updated Successfull`);
    } catch (err) {
        res.status(400).send("Error : " + err.message)
    }
});


module.exports = profileRouter;
