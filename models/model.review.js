let mongoose = require("mongoose");

let ReviewSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    organiserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organiser",
    },
    avgRating: {
      type: Number,
      default: 0,
    },
    foodRating: {
      type: Number,
      default: 0,
    },
    serviceRating: {
      type: Number,
      default: 0,
    },
    ambienceRating: {
      type: Number,
      default: 0,
    },
    fanclubinteractionRating: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: Number,
      default: 0, // 0 for Pending , 1 for approved , 2 for rejected
    },
  },
  {
    timestamps: true,
  }
);
const Review = mongoose.model("Review", ReviewSchema);
module.exports = Review;
