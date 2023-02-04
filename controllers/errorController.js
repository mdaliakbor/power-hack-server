const AppError = require("../utils/appError");

// HANDLE CAST ERROR DB
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

// HANDLE DUPLICATED KEY ERROR DB
const handleDuplicatedKeyErrorDB = (err) => {
  const key = Object.keys(err.keyValue)[0];
  const message = `Duplicated ${key} value: "${err.keyValue[key]}". Please use another value!`;
  return new AppError(message, 400);
};

// HANDLE VALIDATION ERROR DB
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((error) => error.message);
  const message = errors.join(". ");
  return new AppError(message, 400);
};

const JWTInvalidError = (err) => {
  return new AppError("Invalid Token! Please login again", 401);
};

const JWTExpiredError = (err) => {
  return new AppError("Token expired! Please login again", 401);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // // console.log(err.message)
  if (err.isOperational) {
    // Operational Error will send to production
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming error will not send to production directly rather will send a genaric error message
    console.error("ERROR 💥", err);

    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

module.exports = function (err, _req, res, _next) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = err;

    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicatedKeyErrorDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = JWTInvalidError(error);
    if (error.name === "TokenExpiredError") error = JWTExpiredError(error);

    sendErrorProd(error, res);
  }
};
