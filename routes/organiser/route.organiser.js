const express = require("express");
const organiserRoute = express.Router();
const {
  register,
  createEvent,
  viewEvent,
  editDetails,
  cancelEvent,
  editEvent,
  switchToUser,
  chooseLeauge,
  chooseTeam,
  numberOfUser,
  changeEmail,
  verifyEmail,
  helpAndSupport,
  viewhelpList,
  viewHelp,
  feedback,
  viewFeedbackList,
  viewFeedback,
  viewEventBookList,
  viewEventBook,
  deactivateAC,
  logout,
  privacySettingPrivate,
  privacySettingPublic,
  setNumTicket,
  orgHome,
  payAndEarning,
  setCoupon,
} = require("../../controllers/organiser/controller.organiser.js");
const userVerify = require("../../middlewares/userAuth.js");
const organiserVerify = require("../../middlewares/organiserAuth.js");
const createMulterMiddleware = require("../../middlewares/upload.js");
const uploads = createMulterMiddleware([
  { name: "profileImage" },
  { name: "photo1" },
  { name: "photo2" },
  { name: "photo3" },
  { name: "photo4" },
]);

// Register (DONE)
organiserRoute.post("/register", uploads, userVerify, register);
organiserRoute.post("/chooseLeauge", userVerify, chooseLeauge);
organiserRoute.post("/chooseTeam", userVerify, chooseTeam);
// (DONE)
organiserRoute.put(
  "/editDetails",
  uploads,
  userVerify,
  organiserVerify,
  editDetails
);

// Create Event (DONE)
organiserRoute.post(
  "/createEvent",
  uploads,
  userVerify,
  organiserVerify,
  createEvent
);

// View/Edit Event (DONE)
organiserRoute.get("/viewEvent/:id", userVerify, organiserVerify, viewEvent);
organiserRoute.put(
  "/editEvent/:id",
  uploads,
  userVerify,
  organiserVerify,
  editEvent
);
organiserRoute.delete(
  "/cancelEvent/:id",
  userVerify,
  organiserVerify,
  cancelEvent
);

// Switch To User (DONE)
organiserRoute.get("/switchToUser", userVerify, organiserVerify, switchToUser);

// total Number of User (DONE)
organiserRoute.get("/numberOfUsers", userVerify, organiserVerify, numberOfUser);

// Help And Support (DONE)
organiserRoute.post(
  "/helpAndSupport",
  userVerify,
  organiserVerify,
  helpAndSupport
);
organiserRoute.get("/helpList", userVerify, organiserVerify, viewhelpList);
organiserRoute.get("/viewHelp/:id", userVerify, organiserVerify, viewHelp);

// Feedback (DONE)
organiserRoute.post("/feedback", userVerify, organiserVerify, feedback);
organiserRoute.get(
  "/feedbackList",
  userVerify,
  organiserVerify,
  viewFeedbackList
);
organiserRoute.get(
  "/viewFeedback/:id",
  userVerify,
  organiserVerify,
  viewFeedback
);

// Change Email (DONE)
organiserRoute.post("/changeEmail", userVerify, organiserVerify, changeEmail);
organiserRoute.post("/verifyEmail", userVerify, organiserVerify, verifyEmail);

// Event Booking (DONE)
organiserRoute.get(
  "/viewEventBookList",
  userVerify,
  organiserVerify,
  viewEventBookList
);
organiserRoute.get(
  "/viewEventBook/:id",
  userVerify,
  organiserVerify,
  viewEventBook
);

// Privacy (DONE)
organiserRoute.get(
  "/privacySettingPrivate",
  userVerify,
  organiserVerify,
  privacySettingPrivate
);
organiserRoute.get(
  "/privacySettingPublic",
  userVerify,
  organiserVerify,
  privacySettingPublic
);

// Logout + Deactivate Account (DONE)
organiserRoute.get("/logout", userVerify, organiserVerify, logout);
organiserRoute.get("/deactivateAC", userVerify, organiserVerify, deactivateAC);

// Set No. Of Ticket per user (DONE)
organiserRoute.post("/setNumTicket", userVerify, organiserVerify, setNumTicket);

// Organiser Stats
organiserRoute.get("/orgHome", userVerify, organiserVerify, orgHome);
organiserRoute.get(
  "/payAndEarning",
  userVerify,
  organiserVerify,
  payAndEarning
);

// Set Coupon Code for particular event
organiserRoute.post("/setCoupon/:id", userVerify, organiserVerify, setCoupon);

module.exports = organiserRoute;
