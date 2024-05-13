const mongoose = require("mongoose");

const organiser = mongoose.Schema(
  {
    profilePicture: {
      type: String,
    },

    organiserName: {
      type: String,
    },

    buisnessEmail: {
      type: String,
      unique: true,
    },
    location: {
      lat: {
        type: String,
      },
      long: {
        type: String,
      },
    },

    photos: [
      {
        type: String,
      },
    ],

    chooseLeauge: [
      {
        type: String,
        require: true,
      },
    ],
    chooseTeam: [
      {
        type: String,
        require: true,
      },
    ],

    events: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Events",
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },

    otp: {
      type: String,
      default: "",
    },
    tempEmail: {
      type: String,
      default: "",
    },
    status: {
      type: Number,
      default: 0, // 0 for Pending , 1 for Verify , 2 for Rejected
    },
    view: {
      type: Number,
      default: 1, // 1 for Everyone , 2 for no-one
    },
  },
  {
    timestamps: true,
  }
);
const Organiser = mongoose.model("Organiser", organiser);
module.exports = Organiser;
