const mongoose = require("mongoose");

const userProfile = mongoose.Schema(
  {
    favLeauge: [
      {
        type: String,
      },
    ],

    favTeam: [
      {
        type: String,
        default: [],
      },
    ],
    firstName: {
      type: String,
    },

    dob: {
      type: String,
    },
    profileImage: {
      type: String,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);
const UserProfile = mongoose.model("UserProfile", userProfile);
module.exports = UserProfile;
