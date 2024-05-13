const mongoose = require("mongoose");

const admin = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },

    email: {
      type: String,
    },

    otp: {
      type: String,
      default: "",
    },

    tempEmail: {
      type: String,
    },
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", admin);
module.exports = Admin;
