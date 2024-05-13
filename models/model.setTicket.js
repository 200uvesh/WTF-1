const mongoose = require("mongoose");

const setNumTicket = new mongoose.Schema(
  {
    num_ticket: {
      type: Number,
      required: true,
    },

    organiserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organiser",
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
  },
  { timestamps: true }
);

const SetNumTicket = mongoose.model("SetNumTicket", setNumTicket);
module.exports = SetNumTicket;
