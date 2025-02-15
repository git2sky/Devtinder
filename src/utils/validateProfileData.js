const validator = require('validator');

 const validateSignupData = (req)=>{
   const {firstName , lastName , emailId , password} = req.body;

   if( !firstName || !lastName){
       throw new Error("First Name and Last Name is required field");
   }
   
   if(!validator.isEmail(emailId)){
      throw new Error("Invalid Email ID");
   }

   if(!validator.isStrongPassword(password)){
    throw new Error("Password is not strong");
 }

}

const validateProfileEditData = (req) => {
    const alloweField = ["firstName", "lastName", "age", "skills", "gender"];
    const isEditAllowed = Object.keys(req.body).every(field => {
        return alloweField.includes(field);
    });
    return isEditAllowed;
}

module.exports = {
    validateSignupData,
    validateProfileEditData
};