const express = require("express");
const Router = express.Router();

const { register, login, currntUser } = require("../controller/auth");
const { userCheck, adminCheck } = require("../middleware/authcheck");
const rateLimiter = require("../middleware/ragelimit"); 

// Login
Router.post("/login", login); 

// Register
Router.post("/register", register);

// Current User
Router.post("/current-user", userCheck, currntUser);

// Current Admin
Router.post("/current-admin", userCheck, adminCheck, currntUser);

module.exports = Router;
