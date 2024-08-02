const mongoose = require("mongoose");

const user_schema = new mongoose.Schema({
  username: String,
  phoneNumber: String,
  password: String,
  tokenSecret: String,
  // Timestamps
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const users = mongoose.model("user", user_schema);
exports.users = users;
