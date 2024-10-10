// src/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true,
    },
    branch: {
      type: String,
      required: false ,
    },
    city: {
      type: String,
    },
    role: {
      type: String,
      enum: ["Admin", "Super-Admin", "Marketer"],
      default: "Admin",
    },
  },
  { timestamps: true }
);


userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const UserModel = mongoose.model("User", userSchema);

module.exports = {
  UserModel,
};
