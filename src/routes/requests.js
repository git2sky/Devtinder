const express = require('express');
const requestRouter = express.Router();
const { userAuth } = require('../middlewares/userAuth.js');
const ConnectionRequest = require('../models/connectionRequests.js');

requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
    try {
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;
        const allowedStatus = ["interested" , "ignored"];

        if(!allowedStatus.includes(status)){
           return res.status(400).send("Invalid status type : "+ status)
        }

        const connectionRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status
        });
        const data = await connectionRequest.save();
        res.json({
            message : "Connection request sent successfully!",
            data
        });
    } catch (err) {
        res.status(400).send("ERROR : " + err.message);
    }
});

module.exports = requestRouter;