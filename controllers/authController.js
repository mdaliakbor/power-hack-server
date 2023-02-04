const { promisify } = require("util");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");

const signToken = (id) => {
  // return jwt.sign({ id }, process.env.JWT_SECRET, {
  //     expiresIn: process.env.JWT_EXPIRES_IN,
  // })
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

exports.signup = catchAsync(async (req, res, next) => {
  const { username, email, password, confirmPassword } = req.body;
  const newUser = await User.create({
    username,
    email,
    password,
    confirmPassword,
  });

  const token = signToken(newUser._id);
  res
    .status(201)
    .cookie("refresh_token", "Bearer " + token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    })
    .json({
      status: "success",
      token,
      data: {
        user: {
          username: newUser.username,
          email: newUser.email,
          avatar: newUser.avatar,
          phone: newUser.phone || null,
          firstName: newUser.firstName || null,
          lastName: newUser.lastName || null,
        },
      },
    });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) CHECK EMAIL AND PASSWORD EXISTS OR NOT
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }

  // 2) CHECK USER EXISTS AND PASSWORD CORRECT OR NOT
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Invalid email or password!", 401));
  }

  // 3) SEND TOKEN TO CLIENT
  const token = signToken(user._id);

  res
    .status(200)
    .cookie("refresh_token", "Bearer " + token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    })
    .json({
      status: "success",
      token,
      data: {
        user: {
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          phone: user.phone || null,
          firstName: user.firstName || null,
          lastName: user.lastName || null,
        },
      },
    });
});

exports.refreshUser = catchAsync(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    status: "success",
    data: {
      user: {
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        phone: user.phone || null,
        firstName: user.firstName || null,
        lastName: user.lastName || null,
      },
    },
  });
});

exports.logout = catchAsync(async (req, res, next) => {
  res
    .status(204)
    .clearCookie("refresh_token", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    })
    .json({
      status: "success",
      data: null,
    });
});

exports.protect = catchAsync(async (req, _res, next) => {
  // console.log("cookies", req.cookies);
  // 1) Getting token and check of it's here
  let token;
  if (req.cookies.refresh_token) {
    token = req.cookies.refresh_token.split(" ")[1];
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("You are not logged in! Please log in.", 401));
  }
  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const freshUser = await User.findById(decoded.id);

  if (!freshUser) {
    return next(new AppError("No user exists with this token!", 401));
  }

  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You have no permission to perform this action!", 403)
      );
    }

    next();
  };
};
