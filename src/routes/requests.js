const express = require('express');
const requestRouter = express.Router();
const {userAuth} = require('../middlewares/userAuth.js');

requestRouter.post("/sendConnectionRequest", userAuth, async (req,res)=>{
    const user = req.user;
    console.log(user.firstName +" sending conn req");
    res.status(200).send("Connection req sent");
});

module.exports = requestRouter;