const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({
    fromUserId :{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User', // reference to the user collection, imp for interview , ref and populate
        required : true
    },
    toUserId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    status : {
         type : String,
         required : true,
         enum : ["ignored", "interested", "accepted", "rejected"],
         message : `{VALUE} is not a correct status type`
    }
},{
    timestamps: true
});

//compound index on fromUserId and toUserId
connectionRequestSchema.index({fromUserId : 1 , toUserId : 1});
//this middleware will be called before db save method is called
connectionRequestSchema.pre("save" , function(next){
    const connectionRequest = this;
    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
        throw new Error('Connection request can not be sent to same user');
    }
    next();
})

const connectionRequest = mongoose.model("connectionRequestSchema" , connectionRequestSchema);
module.exports = connectionRequest;