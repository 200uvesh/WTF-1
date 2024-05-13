require("dotenv").config();

const jwt = require("jsonwebtoken");
const Organiser = require("../../models/model.organiser.js");
const Event = require("../../models/model.event.js");
const User = require("../../models/model.user.js");
const HelpSupp = require("../../models/model.helpSupp.js");
const Feedback = require("../../models/module.feedback.js");
const Review = require("../../models/model.review.js");
const Admin = require("../../models/model.admin.js");
const { sendEMail } = require("../../utils/emialOTP.js");

// Register Admin (DONE)
exports.registerAdmin = async (req, res) => {
  const { username, email, admin_key } = req.body;
  try {
    if (!(username && email && admin_key)) {
      console.log("All the fields are required");
      res.status(400).json({ message: "All the fields are required" });
    }
    if (admin_key !== process.env.ADMIN_KEY) {
      console.log(" admin key is not correct");
      res.status(400).json({ message: "admin key is not correct" });
    }

    const admin = await Admin.findOne({ email: email });

    if (admin) {
      console.log(" admin already register to this email ");
      return res
        .status(400)
        .json({ error: "   admin already register to this email " });
    }

    function generateOTP() {
      return Math.floor(Math.random() * 9000) + 1000;
    }
    const otp = generateOTP();
    console.log(otp);

    const registerAdmin = await Admin.create({
      username,
      tempEmail: email,
      otp,
    });
    console.log(registerAdmin);
    // sendEmail
    sendEMail(email, otp);
    console.log("OTP has been send sucessfully on your  email");
    res
      .status(200)
      .json({ message: "OTP has been send sucessfully on your email", otp });
  } catch (error) {
    console.log("Error during register Admin", error);
    res.status(500).json({ message: "Error during register Admin" });
  }
};

// verify Admin (DONE)
exports.verifyAdmin = async (req, res) => {
  try {
    const { otp, email } = req.body;
    const adminDetails = await Admin.findOne({ tempEmail: email });
    if (!adminDetails) {
      console.log("Error in fetching Admin Details ");
      res.status(400).json("Error in fetching Admin Details ");
    }
    if (adminDetails.otp != otp) {
      adminDetails.otp = "";
      adminDetails.tempEmail = "";
      console.log("Otp is not matched Please try again later");
      await adminDetails.save();
      res
        .status(400)
        .json({ message: "Otp is not matched Please try again later" });
    }
    const registerAdmin = await Admin.findByIdAndUpdate(
      adminDetails._id,
      { $set: { email: adminDetails.tempEmail, tempEmail: "", otp: "" } },
      { new: true }
    );
    if (!registerAdmin) {
      console.log("Admin is not created please try again later");
      res
        .status(400)
        .json({ message: "Admin is not created please try again later" });
    }

    const payload = {
      adminId: registerAdmin._id,
    };

    jwt.sign(payload, process.env.JWT_SECRET_KEY_ADM, async (error, token) => {
      if (error) {
        throw error;
      }

      res.cookie("adminToken", token, {
        httpOnly: true,
        secure: false,
        expires: new Date(Date.now() + 25892000000),
      });

      console.log("Admin Register Sucessfully ");
      res
        .status(200)
        .json({ message: "Admin Register Sucessfully ", registerAdmin });
    });
  } catch (error) {
    console.log("Error During Verifying Emial ; ", error);
    res.status(500).json({ message: "Error During Verifying Emial " });
  }
};

// Verify Help And Support (DONE)
exports.verifyHelp = async (req, res) => {
  try {
    const helpAndSupp = await HelpSupp.findByIdAndUpdate(
      req.id,
      { status: 1 },
      { new: true }
    );

    if (!helpAndSupp) {
      console.log("Please enter Correct Help and Support ID");
      res
        .status(400)
        .json({ message: "Please enter Correct Help and Support ID" });
    }

    console.log("Verify Help and Support Sucessfully !!");
    res
      .status(200)
      .json({ message: "Verify Help and Support Sucessfully !!", helpAndSupp });
  } catch (error) {
    console.log("Error during verify Help", error);
    res.status(500).json({ message: "Error during verify Help" });
  }
};

// Reject Help and Support (DONE)
exports.rejectHelp = async (req, res) => {
  try {
    const helpAndSupp = await HelpSupp.findByIdAndUpdate(
      req.id,
      { status: 2 },
      { new: true }
    );
    if (!helpAndSupp) {
      console.log("Please enter Correct Help and Support ID");
      res
        .status(400)
        .json({ message: "Please enter Correct Help and Support ID" });
    }

    console.log("reject Help and Support Sucessfully !!");
    res
      .status(200)
      .json({ message: "reject Help and Support Sucessfully !!", helpAndSupp });
  } catch (error) {
    console.log("Error during reject Help", error);
    res.status(500).json({ message: "Error during reject Help" });
  }
};

// Verify feedback (DONE)
exports.verifyFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.id,
      { status: 1 },
      { new: true }
    );
    if (!feedback) {
      console.log("Please enter Correct feedback ID");
      res.status(400).json({ message: "Please enter Correct feedback ID" });
    }
    console.log("Verify Feedback and Support Sucessfully !!");
    res
      .status(200)
      .json({ message: "Verify Help and Support Sucessfully !!", feedback });
  } catch (error) {
    console.log("Error during verify feedbck", error);
    res.status(500).json({ message: "Error during verify feedback" });
  }
};

// Reject Feedback (DONE)
exports.rejectFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.id,
      { status: 2 },
      { new: true }
    );
    if (!feedback) {
      console.log("Please enter Correct feedback ID");
      res.status(400).json({ message: "Please enter Correct feedback ID" });
    }

    console.log("Reject Feedback and Support Sucessfully !!");
    res
      .status(200)
      .json({ message: "Reject Help and Support Sucessfully !!", feedback });
  } catch (error) {
    console.log("Error during reject feedbck", error);
    res.status(500).json({ message: "Error during reject feedback" });
  }
};

// Block User (DONE)
exports.blockUser = async (req, res) => {
  try {
    const userData = await User.findByIdAndUpdate(
      req.id,
      { active: 2 },
      { new: true }
    );
    if (!userData) {
      console.log("Please enter Correct user ID");
      res.status(400).json({ message: "Please enter Correct user ID" });
    }

    console.log("User blocked Sucessfully !!");
    res.status(200).json({ message: "User blocked Sucessfully !!", userData });
  } catch (error) {
    console.log("Error During Block User", error);
    res.status(500).json({ message: "Error During Block User" });
  }
};

// Verify User (DONE)
exports.verifyUser = async (req, res) => {
  try {
    const userData = await User.findByIdAndUpdate(
      req.id,
      { active: 1 },
      { new: true }
    );
    if (!userData) {
      console.log("Please enter Correct user ID");
      res.status(400).json({ message: "Please enter Correct user ID" });
    }

    console.log(" User Verify  Sucessfully !!");
    res.status(200).json({ message: " User Verify  Sucessfully !!", userData });
  } catch (error) {
    console.log("Error During Block User", error);
    res.status(500).json({ message: "Error During Block User" });
  }
};

// Block Organiser (DONE)
exports.blockOrganiser = async (req, res) => {
  try {
    const organiserData = await Organiser.findByIdAndUpdate(
      req.id,
      { status: 2 },
      { new: true }
    );
    if (!organiserData) {
      console.log("Please enter Correct organiser ID");
      res.status(400).json({ message: "Please enter Correct organiser ID" });
    }
    console.log("Block Organiser  Sucessfully !!");
    res
      .status(200)
      .json({ message: " Block Organiser  Sucessfully !!", organiserData });
  } catch (error) {
    console.log("Error During Block Organiser", error);
    res.status(500).json({ message: "Error During Block Organiser" });
  }
};

// Verify Organiser (DONE)
exports.verifyOrganiser = async (req, res) => {
  try {
    const organiserData = await Organiser.findByIdAndUpdate(
      req.id,
      { status: 1 },
      { new: true }
    );
    if (!organiserData) {
      console.log("Please enter Correct organiser ID");
      res.status(400).json({ message: "Please enter Correct organiser ID" });
    }
    console.log("Verify Organiser  Sucessfully !!");
    res
      .status(200)
      .json({ message: " Verify Organiser  Sucessfully !!", organiserData });
  } catch (error) {
    console.log("Error During verify Organiser", error);
    res.status(500).json({ message: "Error During verify Organiser" });
  }
};

// Block Event (DONE)
exports.blockEvent = async (req, res) => {
  try {
    const eventData = await Event.findByIdAndUpdate(
      req.id,
      { status: 2 },
      { new: true }
    );
    if (!eventData) {
      console.log("Please enter Correct Event ID");
      res.status(400).json({ message: "Please enter Correct Event ID" });
    }
    console.log("Block Event  Sucessfully !!");
    res.status(200).json({ message: "Block Event Sucessfully !!", eventData });
  } catch (error) {
    console.log("Error During Block Event", error);
    res.status(500).json({ message: "Error During Block Event" });
  }
};

// Verify Event (DONE)
exports.verifyEvent = async (req, res) => {
  try {
    const eventData = await Event.findByIdAndUpdate(
      req.id,
      { status: 1 },
      { new: true }
    );
    if (!eventData) {
      console.log("Please enter Correct Event ID");
      res.status(400).json({ message: "Please enter Correct Event ID" });
    }
    console.log("Verify Event  Sucessfully !!");
    res.status(200).json({ message: "Verify Event Sucessfully !!", eventData });
  } catch (error) {
    console.log("Error During Verify Event", error);
    res.status(500).json({ message: "Error During Verify Event" });
  }
};

// Verify review and Rating (DONE)
exports.verifyReview = async (req, res) => {
  try {
    const reviewData = await Review.findByIdAndUpdate(
      req.id,
      { status: 1 },
      { new: true }
    );
    if (!reviewData) {
      console.log("Please enter Correct review ID");
      return res
        .status(400)
        .json({ message: "Please enter Correct review ID" });
    }

    console.log("Verify review  Sucessfully !!");
    res
      .status(200)
      .json({ message: " Verify review  Sucessfully !!", reviewData });
  } catch (error) {
    console.log("Error During Verify Review", error);
    res.status(500).json({ message: "Error During Verify Review" });
  }
};
