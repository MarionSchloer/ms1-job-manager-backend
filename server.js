import express from "express";
import { JobSource } from "./models/JobSource.js";
import { User } from "./models/User.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost/ms1-job-manager";

mongoose.connect(MONGODB_URI, (err) => {
  if (err) {
    console.log({
      error: "Cannot connect to MongoDB database.",
      err: `"${err}"`,
    });
  }
});

const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 3045;

// middleware um unseren Token aus dem String zu holen
const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    res.sendStatus(403);
  }
};
const decodeJwt = (token) => {
  let base64Url = token.split(".")[1];
  let base64 = base64Url.replace("-", "+").replace("_", "/");
  let decodedData = JSON.parse(
    Buffer.from(base64, "base64").toString("binary")
  );
  return decodedData;
};

app.get("/", (req, res) => {
  res.send("<h1>MS Job Manager API</h1>");
});

// app.post("/login", async (req, res) => {
//   res.send({ username: "marion" });
// });

//app.post hier: bekommt token, wenn token valide ist schickt er user zurück
app.post("/maintain-login", verifyToken, (req, res) => {
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      const data = decodeJwt(req.token);
      res.json({
        user: data.user,
      });
    }
  });
});
app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const user = await User.findOne({ username });

  if (user === null) {
    res.status(403).send("user not found");
  } else {
    const passwordIsCorrect = await bcrypt.compare(password, user.hash);
    res.send(passwordIsCorrect);
  }
});

app.get("/job-sources", async (req, res) => {
  const jobSources = await JobSource.find();
  res.status(200).json(jobSources);
});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
