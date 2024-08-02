const chat_model = require("../schemas/roomsSchema").rooms;
const room_model = require("../schemas/roomsSchema").rooms;
const messages_model = require("../schemas/messagesSchema").messages;
console.log("hello");
const { v4: uuidv4 } = require("uuid");

exports.createRoom = async (req, res) => {
  try {
    const { groupName, participants } = req.body;
    console.log("groupName", groupName);

    const roomId = uuidv4();
    let room;

    if (!groupName) {
      // One-to-one chat
      room = new chat_model({
        roomId,
        participants: participants,
        isGroup: false,
      });
    } else {
      // Group chat
      room = new chat_model({
        roomId,
        roomName: groupName,
        participants: participants,
        isGroup: true,
        groupAdmin: participants[0],
      });
    }

    await room.save();
    res.json({
      success: true,
      roomId: room.roomId,
      roomName: room.roomName || null,
      message: "Room created successfully",
    });
  } catch (error) {
    console.error("Error joining/creating chat:", error);
    res.status(500).json({
      success: false,
      message: "Error joining/creating chat",
      error: error.message,
    });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { roomId } = req.query;
    const messages = await messages_model
      .find({ roomId })
      .sort({ timestamp: 1 })
      .limit(100);

    if (messages.length === 0) {
      return res.status(404).json({ message: "No messages found" });
    }
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getRoomInfo = async (req, res) => {
  const { roomId } = req.query;
  try {
    const room = await room_model
      .findOne({ roomId })
      .populate("participants", "username _id")
      .populate("groupAdmin", "username _id");

    res.json(room);
  } catch (error) {
    res.status(500).json({ error: "Error fetching group info" });
  }
};

exports.addParticipants = async (req, res) => {
  console.log("called");
  const { roomId, participants } = req.body;
  try {
    const room = await room_model.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    room.participants.push(...participants);
    await room.save();
    res.json({
      success: true,
      room: room,
      message: "Participants added successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error adding participants",
    });
  }
};
