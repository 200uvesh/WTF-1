require("dotenv").config();
const sendOTP = require("../../utils/sendOTP.js");
const User = require("../../models/model.user.js");
const Organiser = require("../../models/model.organiser.js");
const UserProfile = require("../../models/model.userProfile.js");
const Follow = require("../../models/model.follow.js");
const Event = require("../../models/model.event.js");
const Review = require("../../models/model.review.js");
const HelpSupp = require("../../models/model.helpSupp.js");
const Feedback = require("../../models/module.feedback.js");
const Booking = require("../../models/model.Booking.js");
const Coupon = require("../../models/model.coupon.js");
const PredictPlayer = require("../../models/model.predictPlayer.js");
const PredictTeam = require("../../models/model.predictTeam.js");
const AddCard = require("../../models/model.addCard.js");
const SetTicket = require("../../models/model.setTicket.js");
const axios = require("axios");
const querystring = require("querystring");
const jwt = require("jsonwebtoken");
const { uploadOnCloudinary } = require("../../utils/cloudnary.js");
const { getDiscount } = require("../../utils/calculateDiscount");
const crypto = require("crypto");
const OAuth = require("oauth-1.0a");
const mongoose = require("mongoose");

// Phone Login(Done)
exports.loginPhone = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    // Check if the phone number already exists
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      const generateOTP = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
      };

      const otp = generateOTP();

      const otpExpiration = new Date();
      otpExpiration.setSeconds(otpExpiration.getSeconds() + 3000000);

      (existingUser.otp = otp), (existingUser.otpExpiration = otpExpiration);
      await existingUser.save();

      await sendOTP(phoneNumber, otp);

      return res.status(200).json({ message: "OTP sent successfully", otp });

      //return res.status(400).json({ error: 'Phone number already registered' })
    }

    // Generate OTP
    // Generate a random OTP
    const generateOTP = () => {
      return Math.floor(100000 + Math.random() * 900000).toString();
    };

    const otp = generateOTP();

    const otpExpiration = new Date();
    otpExpiration.setSeconds(otpExpiration.getSeconds() + 3000000); // 5min
    // Save user data to the database
    const registerUser = await User.create({
      phoneNumber,
      otp,
      otpExpiration,
    });

    // Send OTP via SMS
    await sendOTP(phoneNumber, otp);

    res.status(200).json({ message: "OTP sent successfully", otp });
  } catch (error) {
    console.error("Error during sign-up:", error);
    res.status(500).json({ error: "Error during sign-up" });
  }
};

exports.verifyPhone = async (req, res) => {
  const { otp, phoneNumber } = req.body;

  try {
    // Find user by phone number and OTP
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      user.attempts++;
      user.lastAttemptAt = new Date();
      await user.save();
      return res.status(400).json({ error: "Invalid Phone number" });
    }

    if (user.otpExpiration < Date.now()) {
      console.log("OTP Expired");
      const userFailedOTP = await User.findOneAndUpdate(
        { phoneNumber: phoneNumber },
        { $set: { otp: "" } }
      );
      return res.status(400).json({ error: "Otp Expired" });
    }
    if (
      user.attempts >= 3 &&
      user.lastAttemptAt > new Date(new Date() - 360000)
    ) {
      await User.findOneAndDelete({ phoneNumber });
      return res
        .status(429)
        .json({
          message:
            "Too many failed attempts. Please try again later. After some time ",
        });
    }

    if (user.otp !== otp) {
      user.attempts++;
      user.lastAttemptAt = new Date();
      await user.save();
    } else {
      const payload = {
        _id: user._id,
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET_KEY_USR,
        async (error, token) => {
          if (error) {
            throw error;
          }

          res.cookie("userToken", token, {
            httpOnly: true,
            secure: false,
            expires: new Date(Date.now() + 25892000000),
          });
          user.attempts = 0;
          user.lastAttemptAt = null;
          await user.save();

          await User.findOneAndUpdate(
            { phoneNumber: phoneNumber },
            {
              $set: {
                otp: "",
                otpExpiration: undefined,
                lastAtemptAt: undefined,
                attempts: 0,
              },
            }
          );
          const registerUser = await User.findOne({ phoneNumber }).select(
            "-otp"
          );

          res
            .status(200)
            .json({
              message: "Phone number verified successfully",
              registerUser,
            });
        }
      );
    }
  } catch (error) {
    console.error("Error during OTP verification:", error);
    res.status(500).json({ error: "Error during OTP verification" });
  }
};

// Google Login(DONE)
exports.loginGoogle = async (req, res) => {
  try {
    const redirectURI = encodeURIComponent(
      "http://localhost:8585/user/verifyGoogle"
    );
    const authURL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.CLIENT_ID}&redirect_uri=${redirectURI}&response_type=code&scope=email%20profile`;
    res.send(authURL);
  } catch (error) {
    console.log("Error During Google Login");
    res.send("error");
  }
};

exports.verifyGoogle = async (req, res) => {
  const code = req.query.code;
  try {
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      querystring.stringify({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code: code,
        redirect_uri: "http://localhost:8585/user/verifyGoogle",
        grant_type: "authorization_code",
      })
    );

    const accessToken = tokenResponse.data.access_token;

    // Fetch user details from Google using the access token
    const profileResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log(profileResponse.data.id);
    console.log(profileResponse.data.email);
    console.log(profileResponse.data.name);

    const userData = await User.create({
      googleID: profileResponse.data.id,
      email: profileResponse.data.email,
      firstName: profileResponse.data.name,
    });
    console.log("one");
    console.log(userData);

    const userProfile = await UserProfile.create({
      profileImage: profileResponse.data.picture,
      userId: userData._id,
    });
    console.log("Two");
    console.log(userProfile);
    if (!userProfile) {
      console.log("Error During saving UserProfile Data");
      res.status(400).json({ message: "Error During saving UserProfile Data" });
      return;
    }
    console.log("Three");
    if (!userData) {
      console.log("Error During saving User Data");
      res.status(400).json({ message: "Error During saving User Data" });
      return;
    }
    console.log("Four");
    console.log("Data Saved Sucessfully");

    const dataUser = {
      userData,
      userProfile,
    };
    console.log(dataUser);
    res.status(200).json({ message: "Sign-up successful!", dataUser });
  } catch (error) {
    console.error(error, "Error occurred during sign-up: Verify");
    res.status(500).send("Error occurred during sign-up Verify");
  }
};

// Facebook Login (DONE)
exports.loginFacebook = async (req, res) => {
  const redirectURI = encodeURIComponent(
    "http://localhost:8585/user/verifyFacebook"
  );
  const authURL = `https://www.facebook.com/v13.0/dialog/oauth?client_id=${process.env.FB_APP_ID}&redirect_uri=${redirectURI}`;
  res.send(authURL);
};

exports.verifyFacebook = async (req, res) => {
  console.log("Hii");
  const code = req.query.code;

  try {
    // Exchange code for access token
    const tokenResponse = await axios.get(
      "https://graph.facebook.com/v13.0/oauth/access_token",
      {
        params: {
          client_id: process.env.FB_APP_ID,
          client_secret: process.env.FB_APP_SECRET,
          redirect_uri: "http://localhost:8585/user/verifyFacebook",
          code: code,
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Fetch user details from Facebook using the access token
    const profileResponse = await axios.get(
      "https://graph.facebook.com/v13.0/me",
      {
        params: {
          fields: "id,name",
          access_token: accessToken,
        },
      }
    );
    console.log("Hii");
    console.log(profileResponse.data);
    console.log("By");

    // Process user data
    const userData = await User.create({
      facebookID: profileResponse.data.id,
      firstName: profileResponse.data.name,
    });

    if (!userData) {
      console.log("Error During Daving User Data");
      res.status(400).json({ message: "Error During Daving User Data" });
      return;
    }

    res.status(200).json({ mesage: "Sign-up successful!", userData });
  } catch (error) {
    console.log("Error occurred during sign-up:", error);
    res.status(500).send("Error occurred during sign-up");
  }
};

//Twitter Authentication (DONE)
const oauth = OAuth({
  consumer: {
    key: process.env.TWITTER_CONSUMER_KEY,
    secret: process.env.TWITTER_CONSUMER_SECRET,
  },
  signature_method: "HMAC-SHA1",
  hash_function(baseString, key) {
    return crypto.createHmac("sha1", key).update(baseString).digest("base64");
  },
});

exports.loginTwitter = async (req, res) => {
  const requestData = {
    url: "https://api.twitter.com/oauth/request_token",
    method: "POST",
    data: { oauth_callback: "http://localhost:8585/user/verifyTwitter" },
  };

  axios
    .post(requestData.url, querystring.stringify(requestData.data), {
      headers: oauth.toHeader(oauth.authorize(requestData)),
    })
    .then((response) => {
      const responseData = querystring.parse(response.data);
      res.send(
        `https://api.twitter.com/oauth/authenticate?oauth_token=${responseData.oauth_token}`
      );
    })
    .catch((error) => {
      console.error("Error obtaining request token:");
      res.status(500).send("Error obtaining request token");
    });
};

exports.verifyTwitter = async (req, res) => {
  console.log("Hello 1");

  try {
    const oauthToken = req.query.oauth_token;
    const oauthVerifier = req.query.oauth_verifier;
    console.log(oauthToken);
    console.log(oauthVerifier);

    // Exchange request token and verifier for access token
    const requestData = {
      url: "https://api.twitter.com/oauth/access_token",
      method: "POST",
      data: { oauth_token: oauthToken, oauth_verifier: oauthVerifier },
    };
    console.log("Hello 2");
    console.log(requestData);
    const response = await axios.post(
      requestData.url,
      querystring.stringify(requestData.data),
      {
        headers: oauth.toHeader(oauth.authorize(requestData)),
      }
    );
    console.log("Hello 3");
    const responseData = querystring.parse(response.data);
    const accessToken = responseData.oauth_token;
    const accessTokenSecret = responseData.oauth_token_secret;

    // Fetch user details using the access token
    const userRequestData = {
      url: "https://api.twitter.com/1.1/account/verify_credentials.json",
      method: "GET",
      data: {},
    };
    console.log("Hello 4");
    console.log(userRequestData);
    const headers = oauth.toHeader(
      oauth.authorize(userRequestData, {
        token: accessToken,
        token_secret: accessTokenSecret,
      })
    );
    console.log("Hello 5");
    console.log(userRequestData.url);
    console.log(headers);
    const userResponse = await axios.get(userRequestData.url, headers);

    console.log("Hello 6");
    console.log(userResponse);
    // Process user data
    const userData = {
      twitterId: userResponse.data.id_str,
      username: userResponse.data.screen_name,
      name: userResponse.data.name,
    };
    console.log("Hello 7");
    console.log(userData);

    res.send("Sign-up successful!");
  } catch (error) {
    console.error("Error obtaining access token:");
    res.status(500).send("Error obtaining access token");
  }
};

//------------------------------------------------------------------------------//

// Add Profile (SelectfavLeauge) (DONE)
exports.SelectfavLeauge = async (req, res) => {
  try {
    const { favLeauge } = req.body;
    if (!favLeauge) {
      console.log("Please  Select Leauge first");
      res.status(400).json({ message: "Please choose leauge first" });
    }
    if (favLeauge.length > 3) {
      console.log("You Have exceede limit of choosing Leauge (max:3)");
      res
        .status(400)
        .json({ mesage: "You Have exceede limit of choosing Leauge (max:3)" });
      return;
    }

    //userId
    const profile = await UserProfile.create({
      favLeauge,
      userId: req.user._id,
    });
    const check = await UserProfile.findOne({ userId: req.user._id }).populate(
      "userId"
    );
    //  console.log(check)

    await User.findByIdAndUpdate(
      req.user._id,
      { $set: { userProfile: check._id } },
      { new: true }
    );

    profileDetails = await UserProfile.findOne({ userId: req.user._id }).select(
      "-profileDetails.userId.otp"
    );

    console.log(`Detailed Saved Sucessfully`);
    res
      .status(200)
      .json({ message: "Profile Details Saved successfully", profileDetails });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    res.status(500).json({ error: "Error during OTP verification" });
  }
};
// Add Profile (SelectfavTeam) (DONE)
exports.SelectfavTeam = async (req, res) => {
  try {
    const { favTeam } = req.body;
    if (!favTeam) {
      console.log("Please  Select Team first");
      res.status(400).json({ message: "Please choose Team first" });
    }
    console.log(favTeam);
    if (favTeam.length > 3) {
      console.log("You Have exceede limit of choosing Team (max:3)");
      res
        .status(400)
        .json({ mesage: "You Have exceede limit of choosing Team (max:3)" });
      return;
    }

    let profileDetails = await UserProfile.findOne({ userId: req.user._id });
    console.log(profileDetails);

    profileDetails.favTeam = favTeam;
    profileDetails.save();

    res
      .status(200)
      .json({ message: "favTeam Details Saved successfully", profileDetails });
    console.log(`Detailed Saved Sucessfully`);
  } catch (error) {
    console.error("Error during choosing Team:", error);
    res.status(500).json({ error: "Error during Select Fav Team" });
  }
};

// Edit Profile (DONE)
exports.editProfile = async (req, res) => {
  try {
    const editFields = req.body;

    const user = await User.findById(req.user._id);
    console.log(user.userProfile);

    var editProfile = await UserProfile.findByIdAndUpdate(
      user.userProfile,
      editFields,
      { new: true }
    );
    if (!editProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    console.log(req.files);
    // console.log(req.files.profileImage[0].path)

    const number = Object.keys(req.files).length;
    console.log(number);

    if (number > 0) {
      const response = await uploadOnCloudinary(req.files.profileImage[0].path);
      console.log(response.url);
      const imageURL = response.url;
      editProfile.profileImage = imageURL;
      await editProfile.save();
    }

    const updatedProfile = await UserProfile.findById(editProfile._id).select(
      "-userId"
    );

    return res
      .status(200)
      .json({
        message: "Profile details updated successfully",
        profile: updatedProfile,
      });
  } catch (error) {
    console.log("Something went wrong :", error);
    res.status(500).json({ error: "Error during Edit Profile " });
  }
};

// ViewProfile (DONE)
exports.viewProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const viewProfile = await UserProfile.findById(user.userProfile);
    const data = {
      phoneNumber: user.phoneNumber,
      viewProfile,
    };
    res.status(200).json({ message: "Profile View successfully", data });
  } catch (error) {
    console.log("Something went wrong :", error);
    res.status(500).json({ error: "Error during View Profile " });
  }
};

// View Organiser (DONE)
exports.viewOrganiser = async (req, res) => {
  try {
    const userId = req.user._id;
    const organiserId = req.id;
    console.log(organiserId);
    const OrganiserDetails = await Organiser.findById(organiserId).select({
      buisnessEmail: 0,
      location: 0,
      leauge: 0,
      team: 0,
      userId: 0,
    });
    if (OrganiserDetails.view === 2) {
      console.log(
        "You Can't view this organiser Profile because its profile is private "
      );
      return res
        .status(400)
        .json({
          message:
            "You Can't view this organiser Profile because its profile is private ",
        });
    }

    const eventList = await Event.find({ userId: userId }).select({
      userId: 0,
      organiserId: 0,
    });
    const follows = await Follow.find({ organizerId: req.id });

    console.log(follows);
    const numberOfFollowers = follows.length;
    console.log(numberOfFollowers);

    console.log("View details and Events of organiser Sucess");
    const viewOrganiser = {
      OrganiserDetails,
      eventList,
      numberOfFollowers,
    };
    res.status(200).json({ message: "Sucess", viewOrganiser });
  } catch (error) {
    console.log("Something went wrong :", error);
    res.status(500).json({ error: "Error during View Organiser " });
  }
};

// View event (DONE)
exports.viewEvent = async (req, res) => {
  try {
    const eventId = req.id;
    const showEvent = await Event.findById(eventId).select({ userId: 0 });
    if (!showEvent) {
      console.log("This Event does not exist please choose correct Event");
      res
        .status(400)
        .json({
          message: "This Event does not exist please choose correct Event",
        });
      return;
    }
    res.status(200).json({ sucess: "Event Details :", showEvent });
  } catch (error) {
    console.log("Error during Viewing  Event :", error);
    res.status(500).json({ error: "Error during Viewing  Event " });
  }
};

// View Fav event (DONE)
exports.FavEvent = async (req, res) => {
  try {
    const userId = req.user._id;
    const userDetails = await User.findById(userId);
    const userProfile = await UserProfile.findById(
      userDetails.userProfile,
      "favLeauge favTeam"
    );
    console.log(userProfile);
    // Find events matching user's favorite league or team1 or team2
    const events = await Event.find({
      $or: [
        { leauge: { $in: userProfile.favLeauge } },
        { "match.team1": { $in: userProfile.favTeam } },
        { "match.team2": { $in: userProfile.favTeam } },
      ],
    });

    res.status(200).json({ message: "Favourite Event ", events });
  } catch (error) {
    console.log("Error During FavEvent", error);
    res.status(500).json({ message: "Error During FavEvent", error });
  }
};

// View Rest Event (DONE)
exports.RestEvent = async (req, res) => {
  try {
    const userId = req.user._id;
    const userDetails = await User.findById(userId);
    const userProfile = await UserProfile.findById(
      userDetails.userProfile,
      "favLeauge favTeam"
    );
    console.log(userProfile);
    // Find events matching user's favorite league or team1 or team2
    const events = await Event.find({
      $nor: [
        { leauge: { $in: userProfile.favLeauge[0] } },
        { "match.team1": { $in: userProfile.favTeam[0] } },
        { "match.team2": { $in: userProfile.favTeam[0] } },
      ],
    });

    res.status(200).json({ message: "Rest Event ", events });
  } catch (error) {
    console.log("Error During FavEvent", error);
    res.status(500).json({ message: "Error During Rest Event", error });
  }
};

// Follow(DONE)
exports.follow = async (req, res) => {
  const userId = req.user._id;
  const organizerId = req.id;

  try {
    const existingUser = await Follow.findOne({
      userId: userId,
      organizerId: organizerId,
    });

    if (existingUser) {
      console.log("User Already Follow to this Organiser");
      res
        .status(400)
        .json({ message: "User Already Follow to this Organiser" });
      return;
    }
    const follow = await Follow.create({
      userId,
      organizerId,
    });

    console.log("Followed Sucessfully");
    res.status(200).json({ message: "Followed Sucessfully", follow });
  } catch (error) {
    console.log("Error During Follow Organiser:", error);
    res.status(500).json({ mesage: "Error During Follow Organiser : ", error });
  }
};

// Unfollow(DONE)
exports.unFollow = async (req, res) => {
  const userId = req.user._id;
  const organizerId = req.id;

  try {
    // Check if the user is following the organizer
    const existingFollow = await Follow.findOneAndDelete({
      organizerId: organizerId,
      userId: userId,
    });
    console.log(existingFollow);
    if (!existingFollow) {
      console.log("User not follows to this Organiser");
      res.status(400).json({ message: "User not follows to this Organiser" });
    }
    res
      .status(200)
      .json({ message: "User unfollowed the organizer Sucessfully " });
  } catch (error) {
    console.error("Error unfollowing organizer:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// View Follow Organiser (DONE)
exports.viewFollowedOrganiser = async (req, res) => {
  const userId = req.user._id;
  try {
    const follows = await Follow.find({ userId: userId });
    console.log(follows);

    if (!follows) {
      console.log("You Have not Followed any organiser yet");
      res
        .status(400)
        .json({ message: "You Have not Followed any organiser yet" });
    }

    const numberOfFollowing = follows.length;
    console.log(numberOfFollowing);
    const following = {
      follows,
      numberOfFollowing,
    };
    res.status(200).json({ message: "Followed Organiser", following });
  } catch (error) {
    console.error("Error fetching followed organizers:", error);
    res.status(500).json({ error: "Error fetching followed organizers" });
  }
};

// SwitchToOrganiser (DONE)
exports.switchToOrganiser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.status === "Organiser") {
      console.log("You have Already Switch to Organiser");
      const status = user.status;
      return res
        .status(400)
        .json({
          message: "You have Already Switch to Organiser",
          status: status,
        });
    }

    await User.findByIdAndUpdate(
      req.user._id,
      { $set: { status: "Organiser" } },
      { new: true }
    );
    console.log("switchToOrganiser Sucessfully ");

    const status = await User.findById(req.user._id);
    const Status = status.status;
    res.status(200).json({ message: "switchToOrganiser Sucessfully", Status });
  } catch (error) {
    console.log("Error During SwitchToOrganiser ");
    res
      .status(500)
      .json({ message: "Error During SwitchToOrganiser :", error });
  }
};

// Logout (DONE)
exports.logout = async (req, res) => {
  try {
    res.clearCookie("userToken");
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
    const userProfile = await UserProfile.findOne({ userId: req.user._id });

    await UserProfile.findByIdAndDelete(userProfile._id);
    console.log(" User Profile delete Sucessfully");
    await User.findByIdAndDelete(req.user._id);
    console.log("User Account Deleted Sucessfully ");
    res.clearCookie("userToken");

    if (req.cookies.organiserToken) {
      res.clearCookie("organiserToken");
      res.status(201).json({ message: "Account Delete sucessfully !!" });
    }

    console.log("Account Deactivate Sucessfully ");
    res.status(201).json({ message: "Account Deactivate Sucessfully " });
  } catch (error) {
    console.log("Error During Deactivate your Account");
    res.status(500).json({ message: "Error During Deactivate your Account" });
  }
};

// Post Rating (DONE)
exports.postRating = async (req, res) => {
  const {
    foodRating,
    serviceRating,
    ambienceRating,
    fanclubinteractionRating,
    description,
  } = req.body;
  const organiserId = req.id;
  console.log(organiserId);
  const userId = req.user._id;
  console.log(userId);
  try {
    console.log("I am in Try Block");
    if (description == "") {
      console.log("Description is required ,Please write atleast 40 words");
      res
        .status(400)
        .json({
          message: "Description is required ,Please write atleast 40 words",
        });
    }

    const OrganiserDetails = await Organiser.findById(organiserId);
    console.log(OrganiserDetails);

    if (!OrganiserDetails) {
      console.log("Organiser not found please select Correct Organiser");
      res
        .status(400)
        .json({
          message: "Organiser not found please select Correct Organiser",
        });
    }

    if (
      foodRating > 5 ||
      serviceRating > 5 ||
      ambienceRating > 5 ||
      fanclubinteractionRating > 5 ||
      description > 5
    ) {
      console.log(
        "Limit Exceede you can choose maximum 5 Star for each services"
      );
      res
        .status(400)
        .json({
          message:
            "Limit Exceede you can choose maximum 5 Star for each services",
        });
    }

    let totalRating = 0;

    if (foodRating) {
      totalRating = totalRating + foodRating;
    }
    if (serviceRating) {
      totalRating = totalRating + serviceRating;
    }
    if (ambienceRating) {
      totalRating = totalRating + ambienceRating;
    }
    if (fanclubinteractionRating) {
      totalRating = totalRating + fanclubinteractionRating;
    }

    const avgRating = totalRating / 4;
    console.log(avgRating);

    const userReview = await Review.create({
      foodRating,
      serviceRating,
      ambienceRating,
      fanclubinteractionRating,
      description,
      avgRating,
      organiserId,
      userId,
    });

    const addReview = await Review.findById(userReview._id);
    console.log("Review submit sucessfully ");
    res.status(200).json({ message: "Review submit sucessfully ", addReview });
  } catch (error) {
    console.log("Error During post the Review");
    res.status(500).json({ message: "Error During post the Review" });
  }
};

// View ratingList (DONE)
exports.viewReviewList = async (req, res) => {
  const organiserId = req.id;

  try {
    if (!organiserId) {
      console.log("Organiser Id is Not Valid  , Please Correct Organiser ID");
      res
        .status(400)
        .json({
          message: "Organiser Id is Not Valid  , Please Correct Organiser ID",
        });
    }

    const organiserDetails = await Organiser.findById(organiserId);
    const Name = organiserDetails.organiserName;
    const profile = organiserDetails.profilePicture;
    const follower = await Follow.find({ organizerId: organiserId });

    const orgDetails = {
      Name: Name,
      profile_Image: profile,
      Follower_Count: follower.length,
    };
    console.log(orgDetails);

    const Deatils = await Review.find({
      organiserId: organiserId,
      approved: 1,
    });
    if (!Deatils) {
      console.log(" Error Details Not fetched ");
      res.status(400).json({ message: " Error Details Not fetched" });
    }

    const numberOfReview = Deatils.length;
    console.log(numberOfReview);

    let totalFoodRating = 0;
    let totalServiceRating = 0;
    let TotalambienceRating = 0;
    let totalFanclubinteractionRating = 0;

    Deatils.forEach((element) => {
      totalFoodRating = totalFoodRating + element.foodRating;
      totalServiceRating = totalServiceRating + element.serviceRating;
      TotalambienceRating = TotalambienceRating + element.ambienceRating;
      totalFanclubinteractionRating =
        totalFanclubinteractionRating + element.fanclubinteractionRating;
    });

    const totalaAvgFoodRating = totalFoodRating / numberOfReview;
    const totalaAvgService = totalServiceRating / numberOfReview;
    const totalaAvgambiance = TotalambienceRating / numberOfReview;
    const totalaAvgFanclub = totalFanclubinteractionRating / numberOfReview;
    const overAllreview =
      (totalaAvgFoodRating +
        totalaAvgService +
        totalaAvgambiance +
        totalaAvgFanclub) /
      4;

    console.log(overAllreview);

    const eachRating = {
      overall_Rating: overAllreview,
      Food_Service: totalaAvgFoodRating,
      Service_Rating: totalaAvgService,
      Ambiance: totalaAvgambiance,
      Fan_Club: totalaAvgFanclub,
    };

    console.log(
      "totalaAvgFanclub :",
      " totalaAvgFanclub: ",
      totalaAvgFanclub,
      " totalaAvgService : ",
      totalaAvgService,
      " totalaAvgFoodRating: ",
      totalaAvgFoodRating,
      " totalaAvgambiance: ",
      totalaAvgambiance
    );

    let ratingCounts = {
      one_two: 0,
      two_three: 0,
      three_four: 0,
      four_five: 0,
      five: 0,
    };

    //Star Count %
    console.log("Details length is : ", Deatils.length);

    for (let i = 0; i < Deatils.length; i++) {
      if (Deatils[i].avgRating === 5) {
        ratingCounts["five"]++;
      } else if (Deatils[i].avgRating >= 4) {
        ratingCounts["four_five"]++;
      } else if (Deatils[i].avgRating >= 3) {
        ratingCounts["three_four"]++;
      } else if (Deatils[i].avgRating >= 2) {
        ratingCounts["two_three"]++;
      } else if (Deatils[i].avgRating >= 1) {
        ratingCounts["one_two"]++;
      }
    }

    console.log("Hii 1");

    console.log(ratingCounts);

    console.log("Hii 2");
    const OneStarPer = (ratingCounts.one_two / Deatils.length) * 100;
    const twoStarPer = (ratingCounts.two_three / Deatils.length) * 100;
    const threeStarPer = (ratingCounts.three_four / Deatils.length) * 100;
    const fourStarPer = (ratingCounts.four_five / Deatils.length) * 100;
    const fiveStarPer = (ratingCounts.five / Deatils.length) * 100;

    console.log("Hii 3");
    console.log(OneStarPer, twoStarPer, threeStarPer, fourStarPer, fiveStarPer);
    console.log("Hii 5");

    const Stars = {
      One_Star_Percentage: OneStarPer,
      Two_Star_Percentage: twoStarPer,
      Three_Star_Percentage: threeStarPer,
      Four_Star_Percentage: fourStarPer,
      Five_Star_Percentage: fiveStarPer,
    };

    const AllDetails = {
      orgDetails,
      total_Reviews: numberOfReview,
      Stars,
      eachRating,
      Deatils,
    };

    console.log("Fetch All details Sucessfully ");
    res
      .status(200)
      .json({ message: "Fetch All details Sucessfully :", AllDetails });
  } catch (error) {
    console.log("Error During View Rating List");
    res.status(500).json({ message: "Error During View Rating List: ", error });
  }
};

// Delete review (DONE)
exports.deleteReview = async (req, res) => {
  try {
    const reviewId = req.id;
    await Review.findByIdAndDelete(reviewId);

    console.log("Review deleted Sucessfully");
    res.status(400).json({ message: "Review deleted Sucessfully " });
  } catch (error) {
    console.log("Error During deleting review");
    res.status(500).json({ message: "Error During deleting review" });
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
      userId: req.user._id,
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
    console.log(helpList);

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
      res
        .status(400)
        .json({
          message:
            "Your status  is either pending or blocked at the end of Admin",
        });
    }

    console.log(viewHelp.date);
    console.log("Your Help and Support details fetched sucessfully ");
    res
      .status(200)
      .json({
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
      userId: req.user._id,
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
      res
        .status(400)
        .json({
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
    console.log(feedbackId);
    const viewFeedBack = await Feedback.findById(feedbackId);
    console.log(viewFeedBack);

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
      res
        .status(400)
        .json({
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

//Change Phone Number (DONE)
exports.changePhone = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      console.log("Please Enter Phone Number");
      res.status(400).json({ message: "Please Enter Phone Number" });
    }
    if (phone.length() != 13) {
      console.log("you enter incorrect number of digits in your Phone Number");
      res
        .status(400)
        .json({
          message: "you enter incorrect number of digits in your Phone Number",
        });
    }

    const userDetails = await User.findById(req.user._id);
    if (phone == userDetails.phone) {
      console.log("You Entered previous Number please enter new number");
      res
        .status(400)
        .json({
          message: "You Entered previous Number please enter new number",
        });
    }

    // Generate a random 4-digit number
    function generateOTP() {
      return Math.floor(Math.random() * 9000) + 1000;
    }
    const otp = generateOTP();
    console.log(otp);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { otp: otp, tempNumber: phone } },
      { new: true }
    );

    if (!user) {
      console.log("Error in saving DB");
      res.status(400).json({ message: "Error in saving DB" });
    }

    await sendOTP(phone, otp);
    console.log("OTP has been sent to your Phone Number sucessfully");
    res
      .status(200)
      .json({
        message: "OTP has been sent to your Phone Number sucessfully",
        user,
      });
  } catch (error) {
    console.log("Error during  Change Phone number");
    res.status(500).json({ message: "Error during  Change Phone number" });
  }
};

// change Phone Number (DONE)
exports.verifyChangePhone = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      console.log("Please  enter OTP first");
      res.status(400).json({ message: "Please  enter OTP first" });
    }
    if (otp.length() != 4) {
      console.log("Please Enter exact 4 digit OTP");
      res.status(400).json({ message: "Please Enter exact 4 digit OTP" });
    }

    const userData = await User.findById(req.user._id);
    if (userData.otp != otp) {
      console.log("OTP does not matched please Enter Correct OTP");
      res
        .status(400)
        .json({ message: "OTP does not matched please Enter Correct OTP" });
    }
    const updateData = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { otp: "", phoneNumber: userData.tempNumber, tempNumber: "" } },
      { new: true }
    );
    console.log("verify phone sucessfully ");
    res.status(200).json({ message: "verify phone sucessfully", updateData });
  } catch (error) {
    console.log("Error During verify phone number");
    res.status(500).json({ message: "Error During verify phone number" });
  }
};

// Book now (DONE)
exports.eventBooking = async (req, res) => {
  try {
    const eventId = req.id;
    console.log(eventId);
    const eventDetails = await Event.findById(eventId).select("-Description");
    if (!eventDetails) {
      console.log("Event Details not fetched");
      res.status(400).json({ message: "Event Details not fetched" });
    }
    console.log("Fetched Details Sucessfully !!");
    res
      .status(200)
      .json({ message: "Fetched Details Sucessfully !!", eventDetails });
  } catch (error) {
    console.log("Error During view eventBooking : ", error);
    res.status(500).json({ message: "Error During viewEvent Booking  " });
  }
};

// CheckOut (DONE)
exports.eventCheckOut = async (req, res) => {
  const { totalPrice } = req.body;
  const coupon = req.body.coupon;
  const eventId = req.id;

  try {
    if (!totalPrice) {
      console.log("please provide bo value of total price this is required !!");
      res
        .status(400)
        .json({
          message: "please provide bo value of total price this is required !!",
        });
    }

    const eventDetails = await Event.findById(eventId).select("-description");
    if (!eventDetails) {
      console.log("Event details could bnot fetched");
      return res
        .status(400)
        .json({ message: "Event details could bnot fetched" });
    }

    const ticketLimit = await SetTicket.findOne({
      organiserId: eventDetails.organiserId,
      eventId: eventId,
    });
    const booking = await Booking.find({
      userId: req.user._id,
      eventId: eventId,
    });

    if (ticketLimit) {
      if (booking.length === ticketLimit.num_ticket) {
        console.log("You have exceede your limit of booking event");
        return res
          .status(400)
          .json({ message: "You have exceede your limit of booking event" });
      }
    }

    const saveBooking = await Booking.create({
      userId: req.user._id,
      organizerId: eventDetails.organiserId,
      eventId: req.id,
      totalPrice: totalPrice,
    });

    if (coupon) {
      const appliedCoupon = await Coupon.findOne({
        organiserId: eventDetails.organiserId,
        eventId: eventId,
        coupon_code: coupon,
      });
      if (!appliedCoupon) {
        console.log(
          " Your coupon code is invalid or coupon code has been expired"
        );
        return res
          .status(400)
          .json({
            message:
              "Your coupon code is invalid or this coupon code has been expired",
          });
      }

      const amount_after_discount = getDiscount(
        totalPrice,
        appliedCoupon.discount_rate
      );
      console.log(amount_after_discount);

      saveBooking.couponCode = coupon;
      saveBooking.totalPrice = amount_after_discount;
      await saveBooking.save();
    }

    const bookingDetails = await Booking.findById(saveBooking._id);
    if (!bookingDetails) {
      console.log("Not Booking Event Yet");
      res.status(400).json({ message: "Not Booking Event Yet" });
    }

    console.log("Event Booking Saved Sucessfully !");
    res
      .status(200)
      .json({ message: "Event Booking Saved Sucessfully !", bookingDetails });
  } catch (error) {
    console.log("Error During Event booking : ", error);
    res.status(500).json({ message: "Error During Event booking" });
  }
};

//  View Organiser Photo (DONE)
exports.getOrgPhoto = async (req, res) => {
  const organiserId = req.id;
  try {
    const OrganiserDetails = await Organiser.findById(organiserId);
    if (!OrganiserDetails) {
      console.log("Error during fetching photos");
      res.status(400).json({ message: "Error during fetching photos" });
    }

    const photos = await Organiser.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(organiserId) },
      },

      {
        $project: {
          photos: 1,
        },
      },
    ]);

    console.log("Photo Fetched Sucessfully");
    res.status(200).json({ message: " photo Fetched secessfully ", photos });
  } catch (error) {
    console.log("Error During fetching Organiser Photos");
    res.status(500).json({ message: "Error During fetching Organiser Photos" });
  }
};

// Score Prediction (DONE)
exports.scorePrediction = async (req, res) => {
  const predicted = req.body;

  try {
    const eventId = req.id;
    const event = await Event.findById(eventId);
    const organiserId = event.organiserId;
    const userId = req.user._id;

    if (!predicted) {
      console.log("Please Select Atleast Two Teams to predict Score");
      res
        .status(400)
        .json({ message: "Please Select Atleast Two Teams to predict Score" });
    }

    const alreadyPredictTeam = await PredictTeam.findOne({ userId: req._id });
    const alreadyPredictPlayer = await PredictPlayer.findOne({
      userId: req._id,
    });

    if (alreadyPredictPlayer || alreadyPredictTeam) {
      console.log("You have been alredy predicted the Score for this event ");
      return res
        .status(400)
        .json({
          message: "You have been alredy predicted the Score for this event ",
        });
    }

    const predictedTeam = await PredictTeam.create({
      predictTeam_A_Goal: predicted.predictTeam_A_Goal,
      predictTeam_B_Goal: predicted.predictTeam_B_Goal,
      eventId,
      organiserId,
      userId,
    });

    const predictedPlayer = await PredictPlayer.create({
      player_Goals: predicted.player_Goals,
      eventId,
      organiserId,
      userId,
    });

    const prediction = {
      predictedTeam,
      predictedPlayer,
    };
    console.log("Prediction  saved Sucessfully ");
    res
      .status(200)
      .json({ message: "Prediction  saved Sucessfully ", prediction });
  } catch (error) {
    console.log("Error During Score Prediction");
    res.status(500).json({ message: "Error During Score Prediction" });
  }
};

// Add Card Details (DONE)
exports.addCard = async (req, res) => {
  const { cardNumber, expiryDate } = req.body;

  try {
    if (!(cardNumber || expiryDate)) {
      console.log("Boths Fields are requireds");
      return res.status(400).json({ message: "Boths Fields are requireds" });
    }

    const alreadyCardAdded = await AddCard.findOne({ cardNumber: cardNumber });

    if (alreadyCardAdded) {
      console.log("This Card Number is Already added");
      return res
        .status(400)
        .json({ message: "This Card Number is Already added" });
    }
    const userId = req.user._id;

    const cardAdd = await AddCard.create({
      cardNumber,
      expiryDate,
      userId,
    });

    if (!cardAdd) {
      console.log("Card is not added Sucessfully ");
      return res.status(400).json({ mesage: "Card is not added Sucessfully " });
    }

    console.log("Card Is added sucessfully ");
    res.status(200).json({ message: "Card Is added sucessfully", cardAdd });
  } catch (error) {
    console.log("Error during save Credit or Debit Card details ");
    res
      .status(500)
      .json({ message: "Error during save Credit or Debit Card details" });
  }
};

// Private (DONE)
exports.privacySettingPrivate = async (req, res) => {
  try {
    const changeSetting = await User.findByIdAndUpdate(
      req.user._id,
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
    const changeSetting = await User.findByIdAndUpdate(
      req.user._id,
      { view: 1 },
      { new: true }
    );
    console.log("Change Setting Sucessfully ");
    res
      .status(200)
      .json({ message: "Change Setting Sucessfully", changeSetting });
  } catch (error) {
    console.log("Error During Set Privacy Setting " + error);
    res.status(500).json({ message: "Error During Set Privacy Setting" });
  }
};

// User Stats (DONE)
exports.userStats = async (req, res) => {
  try {
    const pipeline = [
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

    const Amount_Spent = await Booking.aggregate(pipeline);
    console.log("Details fetched sucessfully !");
    res
      .status(200)
      .json({ message: "Details fetched sucessfully !", Amount_Spent });
  } catch (error) {
    console.log("Error During fetching user Stats" + error);
    res.status(500).json({ message: "Error During fetching user Stats" });
  }
};
