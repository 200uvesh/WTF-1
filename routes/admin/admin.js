const express = require("express");
const adminRoute = express.Router();

const adminVerify = require("../../middlewares/adminAuth.js");
const {
  verifyHelp,
  verifyFeedback,
  blockUser,
  blockOrganiser,
  registerAdmin,
  verifyOrganiser,
  rejectHelp,
  rejectFeedback,
  blockEvent,
  verifyUser,
  verifyReview,
  verifyAdmin,
  verifyEvent,
} = require("../../controllers/admin/controller.admin.js");

// Register admin
adminRoute.post("/registerAdmin", registerAdmin);
adminRoute.post("/verifyAdmin", verifyAdmin);

// Help and Support
adminRoute.get("/verifyHelp/:id", adminVerify, verifyHelp);
adminRoute.get("/rejectHelp/:id", adminVerify, rejectHelp);

// Feedback
adminRoute.get("/verifyFeedback/:id", adminVerify, verifyFeedback);
adminRoute.get("/rejectFeedback/:id", adminVerify, rejectFeedback);

// Organiser
adminRoute.get("/verifyOrganiser/:id", adminVerify, verifyOrganiser);
adminRoute.get("/blockOrganiser/:id", adminVerify, blockOrganiser);

// User
adminRoute.get("/blockUser/:id", adminVerify, blockUser);
adminRoute.get("/verifyUser/:id", adminVerify, verifyUser);

// Event
adminRoute.get("/blockEvent/:id", adminVerify, blockEvent);
adminRoute.get("/verifyEvent/:id", adminVerify, verifyEvent);

// Review
adminRoute.get("/verifyReview/:id", adminVerify, verifyReview);

module.exports = adminRoute;
