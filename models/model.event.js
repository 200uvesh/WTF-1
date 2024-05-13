const mongoose = require("mongoose");

const event = mongoose.Schema(
  {
    photos: [
      {
        type: String,
      },
    ],
    NameOfEvent: {
      type: String,
      required: true,
    },

    Description: {
      type: String,
      required: true,
    },
    location: {
      lat: {
        type: String,
      },
      long: {
        type: String,
      },
    },

    TypeAndPrice: [
      {
        type: {
          type: String,
        },

        price: {
          type: Number,
        },
      },
    ],

    leauge: {
      type: String,
      required: true,
    },

    match: {
      team1: {
        type: String,
      },
      team2: {
        type: String,
      },
    },
    price: {
      type: Number,
    },

    dateAndTime: {
      date: {
        type: String,
      },
      time: {
        type: String,
      },
    },
    coupon: {
      type: String,
      default: "WTF30",
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    organiserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organiser",
    },
    status: {
      type: Number,
      default: 1, // 1 active ,  2 for Block
    },
  },
  {
    timestamps: true,
  }
);
const Event = mongoose.model("Event", event);
module.exports = Event;
