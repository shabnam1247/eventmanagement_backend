const mongoose = require('mongoose')



mongoose.connect( process.env.DATABASE).then(()=>{
    console.log('MongoDB Connected');
}).catch((err)=>{
    console.log(`mongoDB connection failed ${err}`);
    
})