require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const { db } = require("./config/config.js");
db();

// Middleware
app.use(bodyParser.json());
app.use(cookieParser("secret"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//UserRoute
const userRoute = require("./routes/user/route.user.js");
app.use("/user", userRoute);

//OrganiserRoute
const OrganiserRoute = require("./routes/organiser/route.organiser.js");
app.use("/organiser", OrganiserRoute);

const adminRoute = require("./routes/admin/admin.js");
app.use("/admin", adminRoute);
// Listner
const PORT = process.env.PORT || 8585;
app.listen(PORT, () => {
  console.log(`Server is Started at http://localhost:${PORT}`);
});
