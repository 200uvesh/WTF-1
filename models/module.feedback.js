let mongoose = require("mongoose");

const feedback = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    concern: {
      type: String,
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organiserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organiser",
    },
    date: {
      type: Date,
      required: true,
    },

    adminReply: {
      type: String,
    },

    status: {
      type: Number,
      default: 0, // 0 for pending , 1 for verified , 2 for rejected
    },
  },
  { timestamps: true }
);

const Feedback = mongoose.model("Feedback", feedback);
module.exports = Feedback;
