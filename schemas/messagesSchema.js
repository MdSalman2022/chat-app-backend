const mongoose = require("mongoose");

const messages_schema = new mongoose.Schema({
  roomId: { type: String, required: true },
  messageId: { type: String, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: String,
  timestamp: { type: Date, default: Date.now },
});

const messages = mongoose.model("messages", messages_schema);
exports.messages = messages;
