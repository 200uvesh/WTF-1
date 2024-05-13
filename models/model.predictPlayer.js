const mongoose = require("mongoose");

const predictPlayer = new mongoose.Schema(
  {
    player_Goals: [
      {
        name: {},
        goal: {},
      },
    ],

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organizer",
    },
    evetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
  },
  { timestamps: true }
);

const PredictPlayer = mongoose.model("PredictPlayer", predictPlayer);
module.exports = PredictPlayer;
