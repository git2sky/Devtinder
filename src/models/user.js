const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { Schema } = mongoose;

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: String,
    emailId: {
        type: String,
        required: true,
        unique: true, // making field unique automatically assigns it a index
        validate: (value) => {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid Email');
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate: (value) => {
            if (!validator.isStrongPassword(value, {
                minLength: 8,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
                returnScore: false,
                pointsPerUnique: 1,
                pointsPerRepeat: 0.5,
                pointsForContainingLower: 10,
                pointsForContainingUpper: 10,
                pointsForContainingNumber: 10,
                pointsForContainingSymbol: 10
            })) {
                throw new Error('Password is not strong enough');
            };
        }
    },
    age: {
        type: Number,
        min: 18,
        max: 100
    },
    gender: {
        type: String,
        required: true,
        lowercase: true,
        enum: ["male", "female", "other"],
        message: "Gender must be 'Male', 'Female', or 'Other'"
    },
    skills: {
        type: [String],
        // required: true,
        // validate: {
        //     validator: function (skillsArray) {
        //         return skillsArray.every(skill => ["java", "javascript", "HTML", "CSS"].includes(skill));
        //     },
        //     message: props => `${props.value} contains an invalid skill. Allowed skills are: Java, JavaScript, HTML, and CSS.`
        // }
    }
}, {
    timestamps: true
});

userSchema.methods.validatePassword = async function (enteredPassword) {
    const user = this;
    const isPasswordValid = await bcrypt.compare(enteredPassword, user.password);
    return isPasswordValid;
}

userSchema.methods.getJWTToken = async function () {
    const user = this;
    const token = await jwt.sign({ _id: user._id }, 'secretOrPrivateKey', { expiresIn: '1h' });
    return token;
}

const userModel = mongoose.model('User', userSchema);
module.exports = userModel;
