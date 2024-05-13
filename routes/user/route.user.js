const express = require("express");
const UserRoute = express.Router();
const {
  loginPhone,
  loginGoogle,
  verifyGoogle,
  loginFacebook,
  verifyFacebook,
  loginTwitter,
  verifyTwitter,
  SelectfavLeauge,
  SelectfavTeam,
  editProfile,
  viewProfile,
  FavEvent,
  RestEvent,
  logout,
  verifyPhone,
  viewOrganiser,
  viewEvent,
  follow,
  unFollow,
  viewFollowedOrganiser,
  switchToOrganiser,
  postRating,
  viewReviewList,
  helpAndSupport,
  feedback,
  viewhelpList,
  viewFeedbackList,
  changePhone,
  verifyChangePhone,
  viewHelp,
  viewFeedback,
  eventBooking,
  eventCheckOut,
  getOrgPhoto,
  deleteReview,
  deactivateAC,
  scorePrediction,
  addCard,
  privacySettingPrivate,
  privacySettingPublic,
  userStats,
} = require("../../controllers/user/controller.user.js");
const userVerify = require("../../middlewares/userAuth.js");

// Register Phone (DONE)
UserRoute.post("/loginPhone", loginPhone);
UserRoute.post("/verifyPhone", verifyPhone);

// Register Google (DONE)
UserRoute.get("/loginGoogle", loginGoogle);
UserRoute.get("/verifyGoogle", verifyGoogle);

//Register Facebook (DONE)
UserRoute.get("/loginFacebook", loginFacebook);
UserRoute.get("/verifyFacebook", verifyFacebook);

//Registration Twitter (DONE)
UserRoute.get("/loginTwitter", loginTwitter);
UserRoute.get("/verifyTwitter", verifyTwitter);

// Profile (DONE)
UserRoute.post("/SelectfavLeauge", userVerify, SelectfavLeauge);
UserRoute.post("/SelectfavTeam", userVerify, SelectfavTeam);

const createMulterMiddleware = require("../../middlewares/upload.js");

const uploads = createMulterMiddleware([{ name: "profileImage" }]);

// (DONE)
UserRoute.put("/editProfile", uploads, userVerify, editProfile);
UserRoute.get("/viewProfile", userVerify, viewProfile);

// View event (DONE)
UserRoute.get("/viewEvent/:id", userVerify, viewEvent);
UserRoute.get("/FavEvent", userVerify, FavEvent);
UserRoute.get("/RestEvent", userVerify, RestEvent);

// View Organiser (DONE)
UserRoute.get("/viewOrganiser/:id", userVerify, viewOrganiser);

// Follow Organiser (DONE)
UserRoute.post("/follow/:id", userVerify, follow);

// unFollow Organiser (DONE)
UserRoute.delete("/unFollow/:id", userVerify, unFollow);

//View Followed Organiser (DONE)
UserRoute.get("/viewFollowedOrganiser", userVerify, viewFollowedOrganiser);

// SwitchTOOrganiser (DONE)
UserRoute.get("/switchToOrganiser", userVerify, switchToOrganiser);

// Logout (REST)
UserRoute.get("/logout", userVerify, logout);
UserRoute.get("/deactivateAC", userVerify, deactivateAC);

// Rating (DONE)
UserRoute.post("/postRating/:id", userVerify, postRating);
UserRoute.get("/viewReviewList/:id", userVerify, viewReviewList);
UserRoute.delete("/deleteReview/:id", userVerify, deleteReview);

// Help And Support (DONE)
UserRoute.post("/helpAndSupport", userVerify, helpAndSupport);
UserRoute.get("/helpList", userVerify, viewhelpList);
UserRoute.get("/viewHelp/:id", userVerify, viewHelp);

// Feedback (DONE)
UserRoute.post("/feedback", userVerify, feedback);
UserRoute.get("/feedbackList", userVerify, viewFeedbackList);
UserRoute.get("/viewFeedback/:id", userVerify, viewFeedback);

// Chnage PhoneNumber (DONE)
UserRoute.post("/changePhone", userVerify, changePhone);
UserRoute.post("/verifyChangePhone", userVerify, verifyChangePhone);

//bookEvent (DONE)
UserRoute.get("/eventBooking/:id", userVerify, eventBooking);
UserRoute.post("/eventCheckOut/:id", userVerify, eventCheckOut);

//view photos of Organiser Details (DONE)
UserRoute.get("/getOrgPhoto/:id", userVerify, getOrgPhoto);

// Score Prediction (DONE)
UserRoute.post("/scorePrediction/:id", userVerify, scorePrediction);

// AddCard (DONE)
UserRoute.post("/addCard", userVerify, addCard);

// Profile Setting (DONE)
UserRoute.get("/privacySettingPrivate", userVerify, privacySettingPrivate);
UserRoute.get("/privacySettingPublic", userVerify, privacySettingPublic);

// Carrer Stats (DONE)
UserRoute.get("/userStats", userVerify, userStats);
module.exports = UserRoute;
