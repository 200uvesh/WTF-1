const mongoose = require("mongoose");

const addCard = new mongoose.Schema(
  {
    cardNumber: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const AddCard = mongoose.model("AddCard", addCard);
module.exports = AddCard;
