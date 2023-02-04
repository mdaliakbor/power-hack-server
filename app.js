const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const userRouter = require("./routes/userRoutes");
const billRouter = require("./routes/billRoutes");

const app = express();

app.use(express.json());
app.use(cookieParser());

// CORS MIDDLEWARE
app.use(
  cors({
    origin: ["http://localhost:3000", "https://power-hack-steel.vercel.app"],
    credentials: true,
  })
);

app.use("/api", userRouter);
app.use("/api", billRouter);

// 404
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

module.exports = app;
