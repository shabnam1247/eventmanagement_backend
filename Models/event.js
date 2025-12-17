const mongoose=require('mongoose');
const category = require('./category');
const eventSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    location:{
        type:String,
        required:true
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category',
        required:true
    },

    maxParticipants:{
        type:Number,
        required:true
    },
    image:{
        type:String,
        required:false
    },
    date:{
        type:Date,
        required:true
    }
});

module.exports=mongoose.model('Event',eventSchema);