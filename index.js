const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');
require("dotenv/config");

app.use(cors());
app.options("*", cors());

// Middleware
app.use(express.json());
app.use(morgan('tiny'));
app.use(authJwt()); // Ensure proper exclusions
app.use(errorHandler);
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));

// Health-check route
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Routes
const usersRoutes = require("./routes/users");
const categoryRoutes = require("./routes/categories");
const postsRoutes = require("./Posts/route/Posts");
const dashboard = require("./routes/Dashboard");

const api = process.env.API_URL;

app.use(`${api}/users`, usersRoutes);
app.use(`${api}/category`, categoryRoutes);
app.use(`${api}/posts`, postsRoutes);
app.use(`${api}/dashboards`, dashboard);

// Database
mongoose
  .connect(process.env.CONNECTION_STRING, {
    dbName: "GourdMobile",
  })
  .then(() => {
    console.log("Database Connection is ready...");
  })
  .catch((err) => {
    console.log(err);
  });

// Server
app.listen(4000, () => {
  console.log("server is running http://localhost:4000");
});
