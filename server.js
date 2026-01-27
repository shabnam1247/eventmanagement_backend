const express = require("express");
const cors = require("cors");
const dotenv = require('dotenv');

dotenv.config();

const app = express();
require("./DB/connection");
const userRoutes = require("./Routes/userRoutes");
const adminRoutes=require("./Routes/adminRoutes")
const facultyRoutes=require("./Routes/facultyRoutes")
const galleryRoutes = require("./Routes/galleryRoutes");
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
app.use("/api/admin",adminRoutes);
app.use("/api/faculty",facultyRoutes);
app.use("/api/gallery", galleryRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
