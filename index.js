const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
// const errorHandler = require('./helpers/error-handler'); // Keep the error handler
require("dotenv/config");

// Enable CORS
app.use(cors());
app.options("*", cors());

// Middleware
app.use(express.json());
app.use(morgan('tiny')); // Log requests
// If you have JWT-based authentication, uncomment the following line after adding JWT handling logic
// const authJwt = require('./helpers/jwt');
// app.use(authJwt());
// app.use(errorHandler); // Error handling middleware
app.use("/public/uploads", express.static(__dirname + "/public/uploads")); // Serve static files

// Routes
// const Users = require("./routes/User"); // Add your user routes logic
const api = process.env.API_URL; // Load the API URL from environment variables

// app.use(`${api}/Users`, Users); // Use user routes at /Users endpoint

// Database Connection
mongoose
  .connect(process.env.CONNECTION_STRING, {
    dbName: "GourdMobile", // Use the GourdMobile database
  })
  .then(() => {
    console.log("Database Connection is ready...");
  })
  .catch((err) => {
    console.log(err);
  });

// Start the Server
app.listen(4000, () => {
  console.log("Server is running on http://localhost:4000");
});
