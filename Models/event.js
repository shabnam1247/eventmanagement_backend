const mongoose=require('mongoose');
const category = require('./category');

const scheduleSchema = new mongoose.Schema({
  time: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  }
}, { _id: false });


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
    venue:{
        type:String,
        required:false
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
    eventScheduletime:[scheduleSchema],
    date:{
        type:Date,
        required:true
    },
    organizer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Faculty',
        required:false
    },
    status:{
        type:String,
        enum:['upcoming',"pastevents","ongoing","cancelled"],
        default:'upcoming'

    }
});

module.exports=mongoose.model('Event',eventSchema);