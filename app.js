const express = require("express");
const cors = require("cors");
const app = express();
const { Server } = require("socket.io");
require("dotenv").config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const FRONTEND_URL =
  process.env.NODE_ENV === "dev"
    ? "http://localhost:5173"
    : "http://103.152.106.143:5173";

// app.use(
//   cors({
//     origin: true,
//     credentials: true,
//   })
// );
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
const http = require("http");
const socketIo = require("socket.io");
const { default: mongoose } = require("mongoose");
const user_model = require("./schemas/usersSchema").users;
const messages_model = require("./schemas/messagesSchema").messages;
const rooms_model = require("./schemas/roomsSchema").rooms;

const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: FRONTEND_URL, // Replace with your frontend domain
    methods: ["GET", "POST"],
    credentials: true,
  },
});
app.get("/", (req, res) => {
  res.status(200).send("Hello from Express!");
  console.log("Hello from Express!");
});

const usersRoute = require("./routes/usersRoute");
const chatRoute = require("./routes/chatRoute");

app.use("/user", usersRoute);
app.use("/chat", chatRoute);

const PORT = process.env.PORT || 5000;
// mongoose.connect("mongodb://localhost:27017/", { dbName: "chat-app" });
mongoose
  .connect("mongodb://localhost:27017/", { dbName: "chat-app" })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Socket.io connection
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("join", (room) => {
    console.log(`Socket ${socket.id} joining room ${room}`);
    socket.join(room);
  });

  socket.on(
    "message",
    async ({ messageId, roomId, sender, receiver, content }) => {
      console.log(`Received message in room ${roomId} from ${sender}`);

      const message = new messages_model({
        roomId,
        messageId,
        sender,
        content,
      });
      await message.save();
      io.to(roomId).emit("message", message);
      io.to(roomId).emit("new-message", { roomId, sender });
      console.log(`Emitting message to room ${roomId}`);
    }
  );

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
server.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);

module.exports = app;
