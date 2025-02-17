const express = require('express');
const {userAuth} = require('../middlewares/userAuth');
const ConnectionRequest = require('../models/connectionRequests.js');
const userRouter = express.Router();

userRouter.get('/user/requests/received', userAuth, async (req,res)=>{
    try{
        const loggedInUser = req.user;
        const connectionRequestsData = await ConnectionRequest.find({
            toUserId : loggedInUser._id,
            status : 'interested'
        }).populate("fromUserId", ["firstName", "lastName", "age", "skills", "gender"]);

        res.json({
            message : "Data fetched successfully",
            data : connectionRequestsData
        });

    }catch(err){
        res.status(400).send("ERROR : " + err.message);
    }
});

module.exports = userRouter;