const mongoose = require("mongoose");

const predictTeam = new mongoose.Schema(
  {
    predictTeam_A_Goal: {
      type: Number,
      required: true,
    },
    predictTeam_B_Goal: {
      type: Number,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organizer",
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
  },
  { timestamps: true }
);

const PredictTeam = mongoose.model("PredictTeam", predictTeam);
module.exports = PredictTeam;
