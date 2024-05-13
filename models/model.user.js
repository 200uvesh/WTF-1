const mongoose = require("mongoose");

const user = mongoose.Schema(
  {
    phoneNumber: {
      type: String,
    },

    otp: {
      type: String,
    },

    googleID: {
      type: String,
    },
    email: {
      type: String,
    },
    firstName: {
      type: String,
    },

    facebookID: {
      type: String,
    },

    twitterID: {
      type: String,
    },

    userProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userProfile",
    },

    organiser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organiser",
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
    otpExpiration: {
      type: Date,
    },

    attempts: {
      type: Number,
      default: 0,
    },
    lastAtemptAt: {
      type: Date,
    },

    status: {
      type: String,
      default: "User",
    },
    active: {
      type: Number,
      default: 1, // active 1 , blocked 2
    },
    tempNumber: {
      type: String,
      default: "",
    },
    view: {
      type: Number,
      default: 1,
    },
  },

  {
    timestamps: true,
  }
);
const User = mongoose.model("User", user);
module.exports = User;
