const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    username: {
      type: String,
      required: [true, "Please tell us your username"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    phone: {
      type: String,
    },
    avatar: {
      type: String,
      default: process.env.DEFAULT_AVATAR,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minLength: [8, "Password must have at list 8 character"],
      select: false,
    },
    confirmPassword: {
      type: String,
      required: [true, "Please provide a confirm password"],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Confirm password not matched with password!",
      },
    },
  },
  { timestamps: true }
);

// CHECKING USER PASSWORD
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// PASSWORD INCEPTING
userSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 12);

  this.confirmPassword = undefined;
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
