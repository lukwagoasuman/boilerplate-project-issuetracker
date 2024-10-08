"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const expect = require("chai").expect;
const cors = require("cors");

require("dotenv").config();

const apiRoutes = require("./routes/api.js");
const fccTestingRoutes = require("./routes/fcctesting.js");
const runner = require("./test-runner");

const mongo = require("mongodb");
const mongoose = require("mongoose");
mongoose.connect(process.env.DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.once("open", () => {
  console.log("connected to MongoDB.");
});

db.on("error", err => {
  console.log(err);
});

mongoose.set("useFindAndModify", false);

let app = express();

app.use("/public", express.static(process.cwd() + "/public"));
app.use(cors({ origin: "*" })); //For FCC testing purposes only
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Sample front-end
app.route("/:project/").get(function(req, res) {
  res.sendFile(process.cwd() + "/views/issue.html");
});
//Index page (static HTML)
app.route("/").get(function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});
//For FCC testing purposes
fccTestingRoutes(app);
//Routing for API
app.use("/api", apiRoutes);
//404 Not Found Middleware
app.use(function(req, res, next) {
  res
    .status(404)
    .type("text")
    .send("Not Found");

  });
//Start our server and tests!
app.listen(process.env.PORT || 3000, function() {
  console.log("Listening on port " + process.env.PORT);
  if (process.env.NODE_ENV === "test") {
    console.log("Running Tests...");
    setTimeout(function() {
      try {
        runner.run();
      } catch (e) {
        let error = e;
        console.log("Tests are not valid:");
        console.log(error);
      }
    }, 3500);
  }
});

module.exports = app; //for testing