const mongoose = require("mongoose");

const coupon = new mongoose.Schema(
  {
    coupon_code: {
      type: String,
      required: true,
    },

    discount_rate: {
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

const Coupon = mongoose.model("Coupon", coupon);
module.exports = Coupon;
