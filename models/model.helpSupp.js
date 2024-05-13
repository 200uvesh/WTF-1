let mongoose = require("mongoose");

const helpSupp = mongoose.Schema(
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
    },
    organiserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organiser",
    },
    date: {
      type: Date,
    },
    adminReply: {
      type: String,
    },
    status: {
      type: Number,
      default: 0, // 0 for pending , 1 for verify , 2 for rejected
    },
  },
  { timestamps: true }
);

const HelpSupp = mongoose.model("Help", helpSupp);
module.exports = HelpSupp;
