const mongoose = require('mongoose')

const connectionString = process.env.DATABASE

mongoose.connect(connectionString).then(()=>{
    console.log('MongoDB Connected');
}).catch((err)=>{
    console.log(`mongoDB connection failed ${err}`);
    
})