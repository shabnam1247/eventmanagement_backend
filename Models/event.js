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
    speakers:{
        type:[String],
        required:false
    },
    image:{
        type:String,
        required:false
    },
    timing:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        required:true
    },
    status:{
        type:String,
        enum:['upcoming','completed','cancelled'],
        default:'upcoming'
    }
});

module.exports=mongoose.model('Event',eventSchema);