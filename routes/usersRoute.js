const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

// Route to create a new user
router.post("/register", usersController.createUser);
router.post("/login", usersController.login);
router.get("/search", usersController.search);
router.get("/contacts", usersController.contacts);
router.get("/verify", usersController.verifyToken);

module.exports = router;
