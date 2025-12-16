const express = require("express");
const cors = require("cors");
require('dotenv').config()
const app = express();
require("./DB/connection")
const userRoutes = require("./Routes/userRoutes");
const adminRoutes=require("./Routes/adminRoutes")
const facultyRoutes=require("./Routes/facultyRoutes")
// entry point server

// middleware to parse JSON requests
app.use(cors(
  {
    origin: '*',
    methods: ['GET','POST','PUT','DELETE'],
    allowedHeaders: ['Content-Type','Authorization']
  }
));
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/admins",adminRoutes);
app.use("/api/faculty",facultyRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
