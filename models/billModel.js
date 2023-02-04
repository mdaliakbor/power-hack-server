const mongoose = require("mongoose");
const validator = require("validator");

const billSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Please tell us your full name"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Please provide your phone number"],
      minLength: [11, "Phone number must have at list 11 character"],
    },
    payableAmount: {
      type: Number,
      required: [true, "Payable amount is required"],
      min: [5, "Payable amount must be greater than or equal to 5"],
    },
  },
  { timestamps: true }
);

const Bill = mongoose.model("Bill", billSchema);

module.exports = Bill;
