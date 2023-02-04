const dotenv = require("dotenv");
const mongoose = require("mongoose");

process.on("uncaughtException", (err) => {
  // console.log("UNCAUGHT EXCEPTION 💥 SHUTTING DOWN...");
  // console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: "./config.env" });
const app = require("./app");
const port = process.env.PORT || 3000;

mongoose
  .set("strictQuery", true)
  .connect(process.env.DATABASE_URL)
  .then((con) => {
    // console.log("Mongoose connected");
    // // console.log(con);
    app.listen(port, () => {
      // console.log(`APP running on port ${port}`);
    });
  });

// const server = app.listen(port, () => {
//     // console.log(`APP running on port ${port}`);
// })

process.on("unhandledRejection", (err) => {
  // console.log("UNHANDLED REJECTION! 💥 SHUTTING DOWN...");
  // console.log(err.name, err.message);
  app.listen(port).close(() => {
    process.exit(1);
  });
});
