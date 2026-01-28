const express = require("express");
const cors = require("cors");
const dotenv = require('dotenv');
const { createServer } = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

require("./DB/connection");
const userRoutes = require("./Routes/userRoutes");
const adminRoutes = require("./Routes/adminRoutes");
const facultyRoutes = require("./Routes/facultyRoutes");
const galleryRoutes = require("./Routes/galleryRoutes");
const chatRoutes = require("./Routes/chatRoutes");

app.use(cors({
  origin: '*',
  methods: ['GET','POST','PUT','DELETE'],
  allowedHeaders: ['Content-Type','Authorization']
}));
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/chat", chatRoutes);

// Socket.io Logic
const Message = require("./Models/Message");

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join_room", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their private room`);
  });

  socket.on("send_message", async (data) => {
    const { senderId, senderModel, receiverId, receiverModel, message } = data;
    
    try {
      // 1. Save message to DB
      const newMessage = new Message({
        sender: senderId,
        senderModel,
        receiver: receiverId,
        receiverModel,
        message
      });
      await newMessage.save();

      // 2. Emit message to specifically the receiver's private room
      io.to(receiverId).emit("receive_message", newMessage);
      
      // 3. (Optional) Echo back to sender for confirmation if not using optimistic UI
      io.to(senderId).emit("message_sent", newMessage);

    } catch (error) {
      console.error("Message error:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
