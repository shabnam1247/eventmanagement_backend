const mongoose=require('mongoose');
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
    maxParticipants:{
        type:Number,
        required:true
    },
    imageUrl:{
        type:String,
        required:false
    },
    date:{
        type:Date,
        required:true
    }
});

module.exports=mongoose.model('Event',eventSchema);