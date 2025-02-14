require("dotenv").config();
const PORT = process.env.PORT || 3000;
const express = require('express');
const connectDB = require('./config/database.js');
const User = require('./models/user.js');
const { validateSignupData } = require('./utils/validateSignupData.js');
const bcrypt = require('bcrypt');
const validator = require('validator');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const {userAuth} = require('./middlewares/userAuth.js');


//Initialize the app
const app = express();

app.use(express.json());
// below middleware parses the cookie in object format
app.use(cookieParser());

//save an intance of model in database collection as an document
app.post("/signup", async (req, res) => {
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

app.post("/login", async (req, res) => {
    try {
        const { emailId, password } = req.body;

        if (!validator.isEmail(emailId)) {
            throw new Error("Email is not correct");
        }

        const user = await User.findOne({ emailId: emailId });

        if (!user) {
            throw new Error("Invalid Credential!");
        }

        const isPasswordValid = user.validatePassword(password);

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

app.get("/profile", userAuth, async (req, res) => {
    try {
        const user = req.user;
        res.send(user);
    } catch (err) {
        res.status(400).send("Error " + err.message)
    }
});

app.post("/sendConnectionRequest", userAuth, async (req,res)=>{
    const user = req.user;
    console.log(user.firstName +" sending conn req");
    res.status(200).send("Connection req sent");
});
// make connection to DB before server started listening the requests
connectDB().then(() => {
    console.log('Database connection established');
    app.listen(PORT, () => {
        console.log("server started at port : "+ PORT);
    });
}).catch((err) => {
    console.log(err);
})