const mongoose = require("mongoose");
const room_schema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
  },
  roomName: {
    type: String,
    required: function () {
      return this.isGroup;
    },
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  isGroup: {
    type: Boolean,
    default: false,
  },
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: function () {
      return this.isGroup;
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const rooms = mongoose.model("room", room_schema);
exports.rooms = rooms;
