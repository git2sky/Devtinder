require("dotenv").config();
const PORT = process.env.PORT || 3000;
const express = require('express');
const connectDB = require('./config/database.js');
const cookieParser = require('cookie-parser');
const app = express();

app.use(express.json());
// below middleware parses the cookie in object format
app.use(cookieParser());

const authRouter = require('./routes/auth.js');
const profileRouter = require('./routes/profile.js');
const requestRouter = require('./routes/requests.js');

app.use('/',authRouter);
app.use('/',profileRouter);
app.use('/',requestRouter);

// make connection to DB before server started listening the requests
connectDB().then(() => {
    console.log('Database connection established');
    app.listen(PORT, () => {
        console.log("server started at port : "+ PORT);
    });
}).catch((err) => {
    console.log(err);
})