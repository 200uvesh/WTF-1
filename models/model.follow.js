const mongoose = require("mongoose");

const followSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organizer",
  },
});

const Follow = mongoose.model("Follow", followSchema);
module.exports = Follow;
