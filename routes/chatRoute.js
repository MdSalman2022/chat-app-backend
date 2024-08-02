const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController.js");

// Route to create a new user
router.get("/messages", chatController.getMessages);
router.get("/group-info", chatController.getRoomInfo);
router.post("/create-chat", chatController.createRoom);
router.put("/add-participants", chatController.addParticipants);

module.exports = router;
