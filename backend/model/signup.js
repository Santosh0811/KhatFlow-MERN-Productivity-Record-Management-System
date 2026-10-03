const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');

const signupSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      unique: true,
      default: () => uuidv4(),
      index: true,
    },

    userName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
      index: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // 🔐 hides password by default
    },

    otp: {
      type: String,
      minlength: 6,
      deafult: null,
    },

    otpExpireAt: {
      type: Date,
      deafult: null,
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Signup", signupSchema);
