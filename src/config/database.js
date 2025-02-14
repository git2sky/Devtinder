//import libraries used
const mongoose = require('mongoose');

//define functions to be exported
const connectDB = async () => {
    await mongoose.connect(
        "mongodb+srv://SanjeevKumar:njCZvaxM3IDQUu3j@cluster0.zfi9g.mongodb.net/DevTinder"
    );
};

// export the functions
module.exports = connectDB;