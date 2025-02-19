const express = require('express');
const {userAuth} = require('../middlewares/userAuth');
const ConnectionRequest = require('../models/connectionRequests.js');
const userRouter = express.Router();

const SAFE_USER_DATA = ["firstName", "lastName", "age", "skills", "gender"];

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

userRouter.get('/user/connections', userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const connectionRequestsData = await ConnectionRequest.find({
            $or: [
                { toUserId: loggedInUser._id, status: 'accepted' },
                { fromUserId: loggedInUser._id, status: 'accepted' }
            ]
        }).populate("fromUserId", SAFE_USER_DATA).populate("toUserId", SAFE_USER_DATA);

        const data = connectionRequestsData.map((row) => {
            if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
                return row.toUserId;
            }
            return row.fromUserId;
        });
        res.json({ data });
    } catch (err) {
        res.status(400).send("ERROR : " + err.message);
    }
});

userRouter.get('/feed', userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const connectionRequestsData = await ConnectionRequest.find({
            $or: [
                { toUserId: loggedInUser._id },
                { fromUserId: loggedInUser._id }
            ]
        }).select("fromUserId toUserId");
        
        const hiddenUsersFromFeed = new Set();
        connectionRequestsData.forEach(user =>{
            hiddenUsersFromFeed.add(user.fromUserId.toString());
            hiddenUsersFromFeed.add(user.toUserId.toString());
        });
        
        const users = await UserActivation.find({
            $and : [
                {_id: { $nin : Array.from(hiddenUsersFromFeed) } },
                {_id: { $ne : loggedInUser._id } }
            ]
        }).select(SAFE_USER_DATA);
        res.send(users)
    } catch (err) {
        res.status(400).send("ERROR : " + err.message);
    }
});

module.exports = userRouter;