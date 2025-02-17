const express = require('express');
const requestRouter = express.Router();
const { userAuth } = require('../middlewares/userAuth.js');
const ConnectionRequest = require('../models/connectionRequests.js');
const User = require('../models/user.js');

requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
    try {
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;
        const allowedStatus = ["interested", "ignored"];

        const toUser = await User.findById(toUserId);
        if(!toUser){
            return res.status(400).json({
                message : "User does not exists"
            })
        }

        if(!allowedStatus.includes(status)){
           return res.status(400).send("Invalid status type : "+ status)
        }

        const connectionRequestExists = await ConnectionRequest.findOne({
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId },
            ],
        });

        if (connectionRequestExists) {
            return res.status(400).send("Connection request already exists");
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

requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const { status, requestId } = req.params;
        const allowedStatus = ["accepted", "rejected"];

        if (!allowedStatus.includes(status)) {
            return res.status(400).send("Invalid status type : " + status)
        }
        const connectionRequest = await ConnectionRequest.findOne({
            _id: requestId,
            status: 'interested',
            toUserId: loggedInUser._id
        })

        if (!connectionRequest) {
            return res.status(404).send("Connection request not found");
        }

        connectionRequest.status = status;

        const data = await connectionRequest.save();
        res.json({
            message: "Connection request "+ status,
            data
        });
    } catch (err) {
        res.status(400).send("ERROR : " + err.message);
    }
});

module.exports = requestRouter;