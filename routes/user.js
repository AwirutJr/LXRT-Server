// routes/user.js
const express = require("express");
const Router = express.Router();

// Middleware
const { userCheck, adminCheck } = require("../middleware/authcheck");
const { uploadImage } = require("../middleware/uploadImage");
const rateLimiter = require("../middleware/ragelimit"); // นำเข้า rate limiter

// Controller
const {
  ProfileUser,
  updateUser,
  updatePassword,
  getUsers,
  AdminEditUser,
  RemoveUser,
  readUser,
  ChangeRole,
  ChangeStatus,
  addCoursetoCart,
  addCoursetoBuy,
  getUserCart,
  saveOrder,
  Mycourse,
  viewCourse,
  RecommendationViewCount,
  updateUserProfile,
} = require("../controller/user");

// Profile Management
Router.get("/user/me/:id", ProfileUser); // List Profile user
Router.put("/user-edit/me/:id", uploadImage, updateUser);
Router.put("/user-edit/user/me/:id", uploadImage, updateUserProfile);
Router.put("/user-edit-password/me/:id", updatePassword); // Change Password
Router.post("/user-change-status", ChangeStatus); // Change Status

// Course on Cart (เพิ่ม Rate Limiter)
Router.post("/user-cart", userCheck, rateLimiter, addCoursetoCart); // ใช้ rate limiter ที่นี้
Router.post("/user-cart-buy", userCheck, rateLimiter, addCoursetoBuy); // ใช้ rate limiter ที่นี้
Router.get("/user-cart", userCheck, getUserCart);
Router.get("/user-course", userCheck, Mycourse);

// Admin Management
Router.post("/user-order", userCheck, saveOrder);

// User Management
Router.get("/users", getUsers); // List all users
Router.get("/user/:id", readUser);
Router.put("/admin-edit-user/:id", AdminEditUser); // Edit Profile user
Router.delete("/admin-delete-user/:id", RemoveUser); // Remove Profile user

// Recommendation
Router.put("/user/watch/:id", userCheck, viewCourse);
Router.get("/user-Recommendation", userCheck, RecommendationViewCount);


module.exports = Router;
