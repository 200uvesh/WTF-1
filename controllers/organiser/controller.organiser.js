require("dotenv").config();
const Organiser = require("../../models/model.organiser.js");
const Event = require("../../models/model.event.js");
const jwt = require("jsonwebtoken");
const User = require("../../models/model.user.js");
const HelpSupp = require("../../models/model.helpSupp.js");
const Feedback = require("../../models/module.feedback.js");
const UserProfile = require("../../models/model.userProfile.js");
const SetNumTicket = require("../../models/model.setTicket.js");
const { uploadOnCloudinary } = require("../../utils/cloudnary.js");
const { sendEMail } = require("../../utils/emialOTP.js");
const Booking = require("../../models/model.Booking.js");
const Coupon = require("../../models/model.coupon.js");

// Register (Details) (DONE)
exports.register = async (req, res) => {
  try {
    const { organiserName, buisnessEmail, location } = req.body;
    const organiser = await Organiser.findOne({ buisnessEmail });
    const user = await User.findById(req.user._id);
    if (organiser) {
      console.log("User Is Alredy an organiser");
      return res.status(400).json({ error: "User Is Alredy an organiser" });
    }

    if (user.status === "Organiser") {
      console.log("To become Organiser Switch to User First");
      return res
        .status(400)
        .json({ mesage: "To become Organiser Switch to User First" });
    }

    const registerOrganiser = await Organiser.create({
      organiserName,
      buisnessEmail,
      location,
      userId: req.user._id,
    });

    let RegisterOrganiser = await Organiser.findById(registerOrganiser._id);
    if (req.files) {
      const number = Object.keys(req.files).length;
      console.log(number);

      if (number > 0) {
        switch (number) {
          case 1:
            const response = await uploadOnCloudinary(
              req.files.profileImage[0].path
            );

            const imageURL = response.url;
            RegisterOrganiser.profilePicture = imageURL;
            await RegisterOrganiser.save();
            break;
          case 2:
            const response1 = await uploadOnCloudinary(
              req.files.profileImage[0].path
            );
            const response2 = await uploadOnCloudinary(
              req.files.photo1[0].path
            );

            const imageURL1 = response1.url;
            RegisterOrganiser.profilePicture = imageURL1;
            const imageURL2 = response2.url;
            RegisterOrganiser.photos[0] = imageURL2;

            await RegisterOrganiser.save();

            break;

          case 3:
            const response01 = await uploadOnCloudinary(
              req.files.profileImage[0].path
            );
            const response02 = await uploadOnCloudinary(
              req.files.photo1[0].path
            );
            const response03 = await uploadOnCloudinary(
              req.files.photo2[0].path
            );

            const imageURL01 = response01.url;
            RegisterOrganiser.profilePicture = imageURL01;
            const imageURL02 = response02.url;
            RegisterOrganiser.photos[0] = imageURL02;
            const imageURL03 = response03.url;
            RegisterOrganiser.photos[1] = imageURL03;

            await RegisterOrganiser.save();

            break;
          case 4:
            const response11 = await uploadOnCloudinary(
              req.files.profileImage[0].path
            );
            const response12 = await uploadOnCloudinary(
              req.files.photo1[0].path
            );
            const response13 = await uploadOnCloudinary(
              req.files.photo2[0].path
            );
            const response14 = await uploadOnCloudinary(
              req.files.photo3[0].path
            );

            const imageURL11 = response11.url;
            RegisterOrganiser.profilePicture = imageURL11;
            const imageURL12 = response12.url;
            RegisterOrganiser.photos[0] = imageURL12;
            const imageURL13 = response13.url;
            RegisterOrganiser.photos[1] = imageURL13;
            const imageURL14 = response14.url;
            RegisterOrganiser.profilePicture = imageURL14;

            await RegisterOrganiser.save();

            break;
          case 5:
            const response001 = await uploadOnCloudinary(
              req.files.profileImage[0].path
            );
            const response002 = await uploadOnCloudinary(
              req.files.photo1[0].path
            );
            const response003 = await uploadOnCloudinary(
              req.files.photo2[0].path
            );
            const response004 = await uploadOnCloudinary(
              req.files.photo3[0].path
            );
            const response005 = await uploadOnCloudinary(
              req.files.photo4[0].path
            );

            const imageURL011 = response001.url;
            RegisterOrganiser.profilePicture = imageURL011;
            const imageURL012 = response002.url;
            RegisterOrganiser.photos[0] = imageURL012;
            const imageURL013 = response003.url;
            RegisterOrganiser.photos[1] = imageURL013;
            const imageURL014 = response004.url;
            RegisterOrganiser.photos[2] = imageURL014;
            const imageURL015 = response005.url;
            RegisterOrganiser.photos[3] = imageURL015;

            await RegisterOrganiser.save();

            break;

          default:
            console.log("Hii");
        }
      }
    }

    const payload = {
      organiserId: registerOrganiser._id,
      userId: req.user._id,
    };

    jwt.sign(payload, process.env.JWT_SECRET_KEY_ORG, async (error, token) => {
      if (error) {
        throw error;
      }

      res.cookie("organiserToken", token, {
        httpOnly: true,
        secure: false,
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRY),
      });
    });
    const RegisterOrganiserData = await Organiser.findById(
      registerOrganiser._id
    );
    console.log("Organiser Register Sucessfully ");
    await User.findByIdAndUpdate(
      req.user._id,
      { $set: { status: "Organiser" } },
      { new: true }
    );
    res.status(200).json({
      message: "Organiser Register Sucessfully ",
      RegisterOrganiserData,
    });
  } catch (error) {
    console.log("Something went wrong :", error);
    res.status(500).json({ error: "Error during register Organiser ", error });
  }
};

// Register(chooseLeauge) (DONE)
exports.chooseLeauge = async (req, res) => {
  try {
    const { chooseLeauge } = req.body;
    if (!chooseLeauge) {
      console.log("Please choose leauge first");
      res.status(400).json({ message: "Please choose leauge first" });
      return;
    }
    if (chooseLeauge.length > 3) {
      console.log("Limit Exceede of choosing Leauge (max:3)");
      res
        .status(400)
        .json({ message: "Limit Exceede of choosing Leauge (max:3)" });
      return;
    }

    var organiserDetails = await Organiser.findOne({ userId: req.user._id });
    organiserDetails.chooseLeauge = chooseLeauge;
    await organiserDetails.save();
    console.log("leauge choose Sucessfully ");
    res
      .status(200)
      .json({ message: "leauge choose Sucessfully", organiserDetails });
  } catch (error) {
    console.log("Error choosing  Leauge : ", error);
  }
};
// Register(chooseTeam) (DONE)
exports.chooseTeam = async (req, res) => {
  try {
    const { chooseTeam } = req.body;
    if (!chooseTeam) {
      console.log("Please choose Team first");
      res.status(400).json({ message: "Please choose Team first" });
    }
    if (chooseTeam.length > 5) {
      console.log("Limit Exceede of choosing Team (max:5)");
      res
        .status(400)
        .json({ message: "Limit Exceede of choosing Leauge (max:3)" });
      return;
    }
    var organiserDetails = await Organiser.findOne({ userId: req.user._id });
    organiserDetails.chooseTeam = chooseTeam;
    await organiserDetails.save();
    console.log("leauge choose Sucessfully ");
    res
      .status(200)
      .json({ message: "Team choose Sucessfully", organiserDetails });
  } catch (error) {
    console.log("Error choosing Team : ", error);
  }
};

//editDetails (DONE)
exports.editDetails = async (req, res) => {
  try {
    const editDetails = req.body;
    const organiserId = req.details.organiserId;

    const user = await User.findById(req.details.userId);
    if (user.status === "User") {
      console.log("You have not switch to Organiser");
      return res
        .status(400)
        .json({ mesage: "You have not switch to Organiser" });
    }

    var editOrganiser = await Organiser.findByIdAndUpdate(
      organiserId,
      editDetails,
      { new: true }
    );

    console.log(req.files);
    // console.log(req.files.profileImage[0].path)

    const number = Object.keys(req.files).length;
    console.log(number);

    if (number > 0) {
      switch (number) {
        case 1:
          const response = await uploadOnCloudinary(
            req.files.profileImage[0].path
          );

          const imageURL = response.url;
          editOrganiser.profilePicture = imageURL;
          await editOrganiser.save();
          break;
        case 2:
          const response1 = await uploadOnCloudinary(
            req.files.profileImage[0].path
          );
          const response2 = await uploadOnCloudinary(req.files.photo1[0].path);

          const imageURL1 = response1.url;
          editOrganiser.profilePicture = imageURL1;
          const imageURL2 = response2.url;
          editOrganiser.photos[0] = imageURL2;

          await editOrganiser.save();

          break;

        case 3:
          const response01 = await uploadOnCloudinary(
            req.files.profileImage[0].path
          );
          const response02 = await uploadOnCloudinary(req.files.photo1[0].path);
          const response03 = await uploadOnCloudinary(req.files.photo2[0].path);

          const imageURL01 = response01.url;
          editOrganiser.profilePicture = imageURL01;
          const imageURL02 = response02.url;
          editOrganiser.photos[0] = imageURL02;
          const imageURL03 = response03.url;
          editOrganiser.photos[1] = imageURL03;

          await editOrganiser.save();

          break;
        case 4:
          const response11 = await uploadOnCloudinary(
            req.files.profileImage[0].path
          );
          const response12 = await uploadOnCloudinary(req.files.photo1[0].path);
          const response13 = await uploadOnCloudinary(req.files.photo2[0].path);
          const response14 = await uploadOnCloudinary(req.files.photo3[0].path);

          const imageURL11 = response11.url;
          editOrganiser.profilePicture = imageURL11;
          const imageURL12 = response12.url;
          editOrganiser.photos[0] = imageURL12;
          const imageURL13 = response13.url;
          editOrganiser.photos[1] = imageURL13;
          const imageURL14 = response14.url;
          editOrganiser.profilePicture = imageURL14;

          await editOrganiser.save();

          break;
        case 5:
          const response001 = await uploadOnCloudinary(
            req.files.profileImage[0].path
          );
          const response002 = await uploadOnCloudinary(
            req.files.photo1[0].path
          );
          const response003 = await uploadOnCloudinary(
            req.files.photo2[0].path
          );
          const response004 = await uploadOnCloudinary(
            req.files.photo3[0].path
          );
          const response005 = await uploadOnCloudinary(
            req.files.photo4[0].path
          );

          const imageURL011 = response001.url;
          editOrganiser.profilePicture = imageURL011;
          const imageURL012 = response002.url;
          editOrganiser.photos[0] = imageURL012;
          const imageURL013 = response003.url;
          editOrganiser.photos[1] = imageURL013;
          const imageURL014 = response004.url;
          editOrganiser.photos[2] = imageURL014;
          const imageURL015 = response005.url;
          editOrganiser.photos[3] = imageURL015;

          await editOrganiser.save();

          break;

        default:
          console.log("Hii");
      }
    }

    res.status(200).json({ message: "Edit Details Sucess", editOrganiser });
  } catch (error) {
    console.log("Error During EditDetails", error);
    res.status(500).json({ error: "Error During EditDetails", error });
  }
};

// Create event (DONE)
exports.createEvent = async (req, res) => {
  try {
    const {
      NameOfEvent,
      Description,
      location,
      TypeAndPrice,
      leauge,
      match,
      dateAndTime,
    } = req.body;

    const user = await User.findById(req.details.userId);
    if (user.status === "User") {
      console.log("You have not switch to Organiser");
      return res
        .status(400)
        .json({ mesage: "You have not switch to Organiser" });
    }

    if (!req.url) {
      console.log("Please Select Atleast One Image before Creating an Event");
      res.status(400).json({
        message: "Please Select Atleast One Image before Creating an Event",
      });
    }
    console.log("Hii");
    console.log(req.files);

    console.log(match);
    var registerEvent = await Event.create({
      NameOfEvent,
      Description,
      location,
      TypeAndPrice,
      leauge,
      match,
      dateAndTime,
      userId: req.details.userId,
      organiserId: req.details.organiserId,
    });

    const number = Object.keys(req.files).length;
    console.log(number);
    if (number > 0) {
      switch (number) {
        case 1:
          const response = await uploadOnCloudinary(req.files.photo1[0].path);

          const imageURL = response.url;
          registerEvent.photos[0] = imageURL;
          await registerEvent.save();
          break;
        case 2:
          const response1 = await uploadOnCloudinary(req.files.photo1[0].path);
          const response2 = await uploadOnCloudinary(req.files.photo2[0].path);

          const imageURL1 = response1.url;
          registerEvent.photos[0] = imageURL1;
          const imageURL2 = response2.url;
          registerEvent.photos[1] = imageURL2;

          await registerEvent.save();

          break;

        case 3:
          const response01 = await uploadOnCloudinary(req.files.photo1[0].path);
          const response02 = await uploadOnCloudinary(req.files.photo2[0].path);
          const response03 = await uploadOnCloudinary(req.files.photo3[0].path);

          const imageURL01 = response01.url;
          registerEvent.photos[0] = imageURL01;
          const imageURL02 = response02.url;
          registerEvent.photos[1] = imageURL02;
          const imageURL03 = response03.url;
          registerEvent.photos[2] = imageURL03;

          await registerEvent.save();

          break;
        case 4:
          const response11 = await uploadOnCloudinary(req.files.photo1[0].path);
          const response12 = await uploadOnCloudinary(req.files.photo2[0].path);
          const response13 = await uploadOnCloudinary(req.files.photo3[0].path);
          const response14 = await uploadOnCloudinary(req.files.photo4[0].path);

          const imageURL11 = response11.url;
          registerEvent.photos[0] = imageURL11;
          const imageURL12 = response12.url;
          registerEvent.photos[1] = imageURL12;
          const imageURL13 = response13.url;
          registerEvent.photos[2] = imageURL13;
          const imageURL14 = response14.url;
          registerEvent.photos[3] = imageURL14;

          await registerEvent.save();

          break;

        default:
          console.log("Hii");
      }
    }

    const RegisterEvent = await Event.findById(registerEvent._id).select({
      userId: 0,
      organiserId: 0,
    });

    console.log("Create Event Sucessfully");
    res
      .status(200)
      .json({ message: "Create Event Sucessfully", RegisterEvent });
  } catch (error) {
    console.log("Error during Event  Creating :", error);
    res.status(500).json({ error: "Error during Event  Creating " });
  }
};

// View event (DONE)
exports.viewEvent = async (req, res) => {
  try {
    const eventId = req.id;
    console.log(eventId);
    const showEvent = await Event.findById(eventId).select({
      userId: 0,
      organiserId: 0,
    });
    if (!showEvent) {
      console.log("This Event does not exist please choose correct Event");
      res.status(400).json({
        message: "This Event does not exist please choose correct Event",
      });
    }

    res.status(200).json({ sucess: "Event Details :", showEvent });
  } catch (error) {
    console.log("Error during Viewing  Event :", error);
    res.status(500).json({ error: "Error during Viewing  Event " });
  }
};

// edit event (DONE)
exports.editEvent = async (req, res) => {
  try {
    const eventId = req.id;
    const editDetails = req.body;

    const user = await User.findById(req.details.userId);
    if (user.status === "User") {
      console.log("You have not switch to Organiser");
      return res
        .status(400)
        .json({ mesage: "You have not switch to Organiser" });
    }
    const event = await Event.findById(eventId);
    if (!event) {
      console.log("Please Choose valid Event");
      return res.status(400).json({ message: "Please Choose valid Event" });
    }

    var eventDetails = await Event.findByIdAndUpdate(eventId, editDetails, {
      new: true,
    });

    console.log(req.files);
    // console.log(req.files.profileImage[0].path)

    const number = Object.keys(req.files).length;
    console.log(number);
    if (number > 0) {
      switch (number) {
        case 1:
          const response = await uploadOnCloudinary(req.files.photo1[0].path);

          const imageURL = response.url;
          eventDetails.photos[0] = imageURL;
          await eventDetails.save();
          break;
        case 2:
          const response1 = await uploadOnCloudinary(req.files.photo1[0].path);
          const response2 = await uploadOnCloudinary(req.files.photo2[0].path);

          const imageURL1 = response1.url;
          eventDetails.photos[0] = imageURL1;
          const imageURL2 = response2.url;
          eventDetails.photos[1] = imageURL2;

          await eventDetails.save();

          break;

        case 3:
          const response01 = await uploadOnCloudinary(req.files.photo1[0].path);
          const response02 = await uploadOnCloudinary(req.files.photo2[0].path);
          const response03 = await uploadOnCloudinary(req.files.photo3[0].path);

          const imageURL01 = response01.url;
          eventDetails.photos[0] = imageURL01;
          const imageURL02 = response02.url;
          eventDetails.photos[1] = imageURL02;
          const imageURL03 = response03.url;
          eventDetails.photos[2] = imageURL03;

          await eventDetails.save();

          break;
        case 4:
          const response11 = await uploadOnCloudinary(req.files.photo1[0].path);
          const response12 = await uploadOnCloudinary(req.files.photo2[0].path);
          const response13 = await uploadOnCloudinary(req.files.photo3[0].path);
          const response14 = await uploadOnCloudinary(req.files.photo4[0].path);

          const imageURL11 = response11.url;
          eventDetails.photos[0] = imageURL11;
          const imageURL12 = response12.url;
          eventDetails.photos[1] = imageURL12;
          const imageURL13 = response13.url;
          eventDetails.photos[2] = imageURL13;
          const imageURL14 = response14.url;
          eventDetails.photos[3] = imageURL14;

          await eventDetails.save();

          break;

        default:
          console.log("Hii");
      }
    } else {
    }

    editEvent = await Event.findById(eventId).select({
      userId: 0,
      organiserId: 0,
    });
    console.log("Event Edit sucessfully");
    res.status(200).json({ message: "Event Edit Sucess", editEvent });
  } catch (error) {
    console.log("Error During Edit Event");
    res.status(500).json({ error: "Error During edit event : ", error });
  }
};

// Cancel event (DONE)
exports.cancelEvent = async (req, res) => {
  try {
    const eventId = req.id;
    const user = await User.findById(req.details.userId);
    if (user.status === "User") {
      console.log("You have not switch to Organiser");
      return res
        .status(400)
        .json({ mesage: "You have not switch to Organiser" });
    }

    await Event.findByIdAndDelete(eventId);

    console.log("Event Edit sucessfully");
    res.status(200).json({ message: "Event Cancel Sucessfully " });
  } catch (error) {
    console.log("Error During Cancel Event");
    res.status(500).json({ error: "Error During edit event : ", error });
  }
};

//switchToUser (DONE)
exports.switchToUser = async (req, res) => {
  try {
    console.log(req.details.userId);

    const user = await User.findById(req.details.userId);
    console.log(user);
    if (user.status === "User") {
      console.log("You Have Already Switch to User");
      return res
        .status(400)
        .json({ message: "You Have Already Switch to User" });
    }

    const switchToUser = await User.findByIdAndUpdate(
      user._id,
      { $set: { status: "User" } },
      { new: true }
    );
    console.log("You Have Sucessfully Switch to User");
    res
      .status(200)
      .json({ message: "You Have Sucessfully Switch to User", switchToUser });
  } catch (error) {
    console.log("Error During SwitchToUser : ", error);
    res.status(200).json({ mesage: "Error During SwitchToUser", error });
  }
};

// changeEmail (DONE)
exports.changeEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const id_organiser = req.details.organiserId;
    const organiserDetails = await Organiser.findById(id_organiser);
    if (organiserDetails.buisnessEmail == email) {
      console.log("You Entered your Current Email Please Enter New Email");
      res.status(400).json({
        message: "You Entered your Current Email Please Enter New Email",
      });
    }

    function generateOTP() {
      return Math.floor(Math.random() * 9000) + 1000;
    }
    const otp = generateOTP();
    console.log(otp);

    const insertOtp = await Organiser.findByIdAndUpdate(
      id_organiser,
      { $set: { otp: otp, tempEmail: email } },
      { new: true }
    );
    console.log(insertOtp.otp);

    sendEMail(email, otp);
    console.log("OTP has been send sucessfully on your new email");
    res.status(200).json({
      message: "OTP has been send sucessfully on your new email",
      otp,
    });
  } catch (error) {
    console.log("Error During change Email");
    res.status(500).json({ message: "Error During change Email" });
  }
};

// VerifyEmial (DONE)
exports.verifyEmail = async (req, res) => {
  try {
    const { otp } = req.body;
    const organiserDetails = await Organiser.findById(req.details.organiserId);
    if (!organiserDetails) {
      console.log("Error in fetching organiser Details ");
      res.status(400).json("Error in fetching organiser Details ");
    }
    if (organiserDetails.otp != otp) {
      organiserDetails.otp = "";
      organiserDetails.tempEmail = "";
      console.log("Otp is not matched Please try again later");
      await organiserDetails.save();
    }
    const updateEmail = await Organiser.findByIdAndUpdate(
      req.details.organiserId,
      {
        $set: {
          buisnessEmail: organiserDetails.tempEmail,
          tempEmail: "",
          otp: "",
        },
      },
      { new: true }
    );
    if (!updateEmail) {
      console.log("Email is not Updated please try again later");
      res
        .status(400)
        .json({ message: "Email is not Updated please try again later" });
    }

    console.log("Email Changed Sucessfully ");
    res
      .status(200)
      .json({ message: "Email Changed Sucessfully ", updateEmail });
  } catch (error) {
    console.log("Error During Verifying Emial ; ", error);
    res.status(500).json({ message: "Error During Verifying Emial " });
  }
};


// Help And Support form post (DONE)
exports.helpAndSupport = async (req, res) => {
  const { title, concern } = req.body;

  try {
    if (!(title || concern)) {
      console.log(" Title and concern  boths are required fields");
      res
        .status(400)
        .json({ message: " Title and concern  boths are required fields" });
    }

    const help = await HelpSupp.create({
      title,
      concern,
      userId: req.details.userId,
      organiserId: req.details.organiserId,
      date: Date.now(),
    });
    if (!help) {
      console.log("Somethig Error at saving details in DB");
      res
        .status(400)
        .json({ message: "Somethig Error at saving details in DB" });
    }

    console.log("Help Support has been posted sucessfully ");
    res
      .status(200)
      .json({ message: "Help Support is posted sucessfully ", help });
  } catch (error) {
    console.log("Error during post help ", error);
  }
};

// View HelpList (DONE)
exports.viewhelpList = async (req, res) => {
  try {
    const helpList = await HelpSupp.find({ status: 1 });

    if (!helpList) {
      console.log(" Currently no help and Support Available in DB ");
      res
        .status(400)
        .json({ message: "Currently no help and Support Available in DB" });
    }

    console.log("Here All the list of Help and Support");
    res
      .status(200)
      .json({ message: "Here All the list of Help and Support", helpList });
  } catch (error) {
    console.log("Error During Viewing Help List");
    res.status(500).json({ message: "Error During Viewing Help List" });
  }
};

// viewHelp (DONE)
exports.viewHelp = async (req, res) => {
  try {
    const helpId = req.id;
    const viewHelp = await HelpSupp.findById(helpId);

    if (!viewHelp) {
      console.log("please enter correct help and support ID");
      res
        .status(400)
        .json({ message: "please enter correct help and support ID" });
    }

    if (viewHelp.status !== 1) {
      console.log(
        "Your status  is either pending or blocked at the end of Admin"
      );
      res.status(400).json({
        message:
          "Your status  is either pending or blocked at the end of Admin",
      });
    }

    console.log(viewHelp.date);
    console.log("Your Help and Support details fetched sucessfully ");
    res.status(200).json({
      message: "Your Help and Support details fetched sucessfully",
      viewHelp,
    });
  } catch (error) {
    console.log("Error During view Help : ", error);
    res.status(500).json({ message: "Error During view Help " });
  }
};

// post feedback form (DONE)
exports.feedback = async (req, res) => {
  const { title, concern } = req.body;
  try {
    if (!(title || concern)) {
      console.log(" Title and concern  boths are required fields");
      res
        .status(400)
        .json({ message: " Title and concern  boths are required fields" });
    }

    const feedback = await Feedback.create({
      title,
      concern,
      userId: req.details.userId,
      organiserId: req.details.organiserId,
      date: Date.now(),
    });
    if (!feedback) {
      console.log("Somethig Error at saving details in DB");
      res
        .status(400)
        .json({ message: "Somethig Error at saving details in DB" });
    }

    console.log("Feedback has been posted sucessfully ");
    res
      .status(200)
      .json({ message: "Feedback has been posted sucessfully ", feedback });
  } catch (error) {
    console.log("Error during post feedback ", error);
    res.status(500).json({ message: "Error during post feedback" });
  }
};

// view feedbackList (DONE)
exports.viewFeedbackList = async (req, res) => {
  try {
    const feedbackList = await Feedback.find({ status: 1 });
    if (!feedbackList) {
      console.log(
        " Currently no feedback Available or your feedback is either pending or rejected at the end of Admin"
      );
      res.status(400).json({
        message:
          " Currently no feedback Available or your feedback is either pending or rejected at the end of Admin",
      });
    }
    console.log("Here All the list of feedbacks");
    res
      .status(200)
      .json({ message: "Here All the list of feedbacks", feedbackList });
  } catch (error) {
    console.log("Error during viewing feedback list");
    res.status(500).json({ message: "Error during viewing feedback list" });
  }
};

// viewFeedback (DONE)
exports.viewFeedback = async (req, res) => {
  try {
    const feedbackId = req.id;
    const viewFeedBack = await Feedback.findById(feedbackId);

    if (!viewFeedBack) {
      console.log("please enter correct help and support ID");
      res
        .status(400)
        .json({ message: "please enter correct help and support ID" });
    }

    if (viewFeedBack.status !== 1) {
      console.log(
        "Your Feedback is either pending or blocked , please contact admin"
      );
      res.status(400).json({
        message:
          "Your Feedback is either pending or blocked , please contact admin",
      });
    }

    const date = viewFeedBack.date;
    console.log(date);
    res
      .status(200)
      .json({ message: "Here your Feedback details ", viewFeedBack });
  } catch (error) {
    console.log("Error During view feedback :", error);
    res.status(500).json({ message: "Error During view feedback :" });
  }
};

// number of user (DONE)
exports.numberOfUser = async (req, res) => {
  try {
    // Agregation Pipeline
    const pipeline = [
      {
        $group: {
          _id: null,
          countUser: {
            $sum: 1,
          },
        },
      },
    ];

    const countUser = await User.aggregate(pipeline);

    console.log(countUser);
    res.status(200).json({ "total Number of Active User are": countUser });
  } catch (error) {
    console.log("error During Fetching number of user");
    res.status(500).json({ message: "error During Fetching number of user" });
  }
};

// viewEventBookList (DONE)
exports.viewEventBookList = async (req, res) => {
  try {
    const BookingList = await Booking.find({
      organizerId: req.details.organiserId,
    });
    console.log(BookingList);
    if (!BookingList) {
      console.log("Booking List not fetched");
      res.status(400).status("Booking List not fetched");
    }
    console.log("Booking List Fetched Sucessfully !");
    res
      .status(200)
      .json({ message: "Booking List Fetched Sucessfully !", BookingList });
  } catch (error) {
    console.log("Error During view Booking list : ", error);
    res.status(500).json({ message: "Error During view Booking list" });
  }
};

// viewEventBook (DONE)
exports.viewEventBook = async (req, res) => {
  const bookingId = req.id;
  try {
    const BookingDetails = await Booking.findById(bookingId)
      .populate("userId")
      .populate("eventId");

    if (!BookingDetails) {
      console.log("Booking Details not found");
      res.status(400).json({ message: "Booking Details not found" });
    }

    console.log("Booking details fetched Sucessfully ");
    res
      .status(200)
      .json({ message: "Booking details fetched Sucessfully", BookingDetails });
  } catch (error) {
    console.log("Error During view Booking list : ", error);
    res.status(500).json({ message: "Error During view Booking list" });
  }
};

// Logout (DONE)
exports.logout = async (req, res) => {
  try {
    res.clearCookie("userToken");
    //   res.clearCookie("organiserToken")
    console.log("Logout Sucess!! ");

    res.status(201).json({ message: "You Have Logout Sucessfully !!" });
  } catch (error) {
    console.log({ message: "Something Went Wrong" });
    res.status(500).json({ message: "Something went wrong : ", error });
  }
};

// deactivateAC (DONE)
exports.deactivateAC = async (req, res) => {
  try {
    const userProfile = await UserProfile.findOne({
      userId: req.details.userId,
    });
    await UserProfile.findByIdAndDelete(userProfile._id);
    console.log(" User Profile delete Sucessfully");
    await User.findByIdAndDelete(req.details.userId);
    console.log(" User Account Deleted Sucessfully ");
    await Organiser.findByIdAndDelete(req.details.organiserId);
    res.clearCookie("userToken");
    res.clearCookie("organiserToken");
    console.log(" Organiser Account Deleted Sucessfully ");

    res.status(200).json({ message: "Account Deactivate Sucessfully" });
  } catch (error) {
    console.log("Error During Deactivate your Account");
    res.status(500).json({ message: "Error During Deactivate your Account" });
  }
};

// Private (DONE)
exports.privacySettingPrivate = async (req, res) => {
  try {
    const changeSetting = await Organiser.findByIdAndUpdate(
      req.details.organiserId,
      { view: 2 },
      { new: true }
    );
    console.log("Change Setting Sucessfully ");
    res
      .status(200)
      .json({ message: "Change Setting Sucessfully", changeSetting });
  } catch (error) {
    console.log("Error During Set Privacy Setting ");
    res.status(500).json({ message: "Error During Set Privacy Setting" });
  }
};

// Public (DONE)
exports.privacySettingPublic = async (req, res) => {
  try {
    const changeSetting = await Organiser.findByIdAndUpdate(
      req.details.organiserId,
      { view: 1 },
      { new: true }
    );
    console.log("Change Setting Sucessfully ");
    res
      .status(200)
      .json({ message: "Change Setting Sucessfully", changeSetting });
  } catch (error) {
    console.log("Error During Set Privacy Setting ");
    res.status(500).json({ message: "Error During Set Privacy Setting" });
  }
};

// Set Ticket Limit (DONE)
exports.setNumTicket = async (req, res) => {
  const { num_ticket } = req.body;
  try {
    if (!num_ticket) {
      console.log("Please Enter Number of Ticket per User");
      return res
        .status(400)
        .json({ message: "Please Enter Number of Ticket per User" });
    }

    const organiserId = req.details.organiserId;

    const SetLimit = await SetNumTicket.create({
      num_ticket,
      organiserId,
    });

    if (!SetLimit) {
      console.log("Limit not set please try again later");
      return res
        .status(400)
        .json({ message: "Limit not set please try again later" });
    }

    console.log(" Ticket Limit set sucessfully");
    res.status(200).json({ message: "Ticket Limit set sucessfully", SetLimit });
  } catch (error) {
    console.log("Error during Set limit , number of Ticket per User ");
    res
      .status(500)
      .json({ message: "Error during Set limit , number of Ticket per User " });
  }
};

// Get Organiser homepage (DONE)
exports.orgHome = async (req, res) => {
  try {
    const pipeline1 = [
      {
        $group: {
          _id: null,
          totalBooking: {
            $sum: 1,
          },
          totalPrice: {
            $sum: "$totalPrice",
          },
        },
      },

      {
        $project: {
          totalBooking: 1,
          totalPrice: 1,
          _id: 0,
        },
      },
    ];
    const pipeline2 = [
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $limit: 2,
      },

      {
        $group: {
          _id: null,
          recently_booking: {
            $sum: 1,
          },
        },
      },

      {
        $project: {
          recently_booking: 1,
          _id: 0,
        },
      },
    ];

    const booking_revenue = await Booking.aggregate(pipeline1);
    const recently_booking = await Booking.aggregate(pipeline2);

    console.log("Details Fetched Sucessfully ");
    res.status(200).json({
      message: "Details Fetched Sucessfully ",
      booking_revenue,
      recently_booking,
    });
  } catch (error) {
    console.log("Error during get Details of Organiser homepage ");
    res
      .status(500)
      .json({ message: "Error during get Details of Organiser homepage " });
  }
};

// get Pay and Earning Details (DONE)
exports.payAndEarning = async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$totalPrice",
          },
        },
      },

      {
        $project: {
          totalRevenue: 1,
          _id: 0,
        },
      },
    ];

    const totalRevenue = await Booking.aggregate(pipeline);

    console.log("Revenue Calculated Sucessfully !");
    res
      .status(200)
      .json({ message: "Revenue Calculated Sucessfully !", totalRevenue });
  } catch (error) {
    console.log("Error during getting Pay And Earninig Data ");
    res
      .status(500)
      .json({ message: "Error during getting Pay And Earninig Data " });
  }
};

// Set Coupon code
exports.setCoupon = async (req, res) => {
  const { coupon_code, discount_rate } = req.body;
  const eventId = req.id;
  const organiserId = req.details.organiserId;

  try {
    if (!(coupon_code && discount_rate)) {
      console.log("Please provide both fields coupon_name and discount_name");
      return res.status(400).json({
        message: "Please provide both fields coupon_name and discount_name",
      });
    }

    const couponSaved = await Coupon.create({
      coupon_code,
      discount_rate,
      eventId,
      organiserId,
    });

    if (!couponSaved) {
      console.log("Coupon not saved Please try again later");
      return res
        .status(400)
        .json({ message: "Coupon not saved Please try again later" });
    }

    console.log("Coupon_code Saved Sucessfully !!");
    res.status(200).json({ message: "Coupon_code Saved Sucessfully !!" });
  } catch (error) {
    console.log("Error During Set Coupon Code", error);
    res.status(500).json({ message: "Error During Set Coupon Code" });
  }
};


// check with AWS AI

exports.loginWithApple = async(req , res)=>{
  try {
    const { email, firstName, lastName, identityToken } = req.body;
    if (!(email && identityToken)) {
      return res.status(400).json({
        message: "Please provide both fields email and identityToken",
      });
    }
    const user = await User.findOne({ email });
    if (user) {
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );
      user.token = token;
      return res.status(200).json(user);
    }
  } catch (error) {
    console.log(error)
  }
}

