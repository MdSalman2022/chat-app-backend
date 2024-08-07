const user_model = require("../schemas/usersSchema").users;
const room_model = require("../schemas/roomsSchema").rooms;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// console.log("JWT_SECRET", process.env.JWT_SECRET);
exports.createUser = async (req, res) => {
  try {
    const { username, phoneNumber, password } = req.body;
    const existingUser = await user_model.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const tokenSecret = crypto.randomBytes(64).toString("hex");
    const user = new user_model({
      username,
      phoneNumber,
      password: hashedPassword,
      tokenSecret,
    });
    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Server error during registration",
      error: error.message,
    });
  }
};

exports.login = async (req, res) => {
  const { phoneNumber, password } = req.body;
  const user = await user_model.findOne({ phoneNumber });
  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET + user.tokenSecret,
      { expiresIn: "24h" }
    );
    res.json({
      user: {
        _id: user._id,
        username: user.username,
        phoneNumber: user.phoneNumber,
      },
      token,
    });
  } else {
    res.status(400).json({ message: "Invalid credentials" });
  }
};

exports.verifyToken = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // Decode the token without verification to get the userId
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Find the user and verify the token with the user-specific secret
    const user = await user_model.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    jwt.verify(token, process.env.JWT_SECRET + user.tokenSecret);

    res.json({
      user: {
        _id: user._id,
        username: user.username,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

exports.search = async (req, res) => {
  try {
    const { phoneNumber } = req.query;
    const trimmedPhoneNumber = phoneNumber.trim();
    const escapedPhoneNumber = trimmedPhoneNumber.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    console.log("Searching for phone number:", escapedPhoneNumber);

    const query = {
      phoneNumber: { $regex: escapedPhoneNumber, $options: "i" },
    };
    console.log("Query:", query);

    const users = await user_model.find(query);
    console.log("Found users:", users);

    res.json(users);
  } catch (error) {
    console.error("Error in search:", error);
    res.status(500).json({
      message: "An error occurred during search",
      error: error.message,
    });
  }
};

exports.contacts = async (req, res) => {
  console.log("contacts");
  const { userId } = req.query;
  // console.log("userId", userId);

  try {
    const rooms = await room_model
      .find({ participants: userId })
      .populate("participants", "_id username phoneNumber");

    // console.log("rooms", rooms);

    const contacts = rooms.map((room) => {
      if (room.isGroup) {
        // Group chat
        return {
          _id: room._id,
          roomName: room.roomName,
          roomId: room.roomId,
          isGroup: true,
          participants: room.participants
            .filter((p) => p._id.toString() !== userId)
            .map((p) => ({
              _id: p._id,
              username: p.username,
              phoneNumber: p.phoneNumber,
            })),
        };
      } else {
        // One-to-one chat
        const otherParticipant = room.participants.find(
          (p) => p._id.toString() !== userId
        );
        return {
          _id: otherParticipant._id,
          username: otherParticipant.username,
          phoneNumber: otherParticipant.phoneNumber,
          roomId: room.roomId,
          isGroup: false,
        };
      }
    });

    res.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching contacts" });
  }
};
