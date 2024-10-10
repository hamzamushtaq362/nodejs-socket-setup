const http = require("http");
const { initSocket } = require("./socketManager");
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./src/db");
const PORT = 5000;
const app = express();
app.use(cors());
//  console.log();
//
const server = http.createServer(app);
initSocket(server);

const { router } = require("./src/routes");
app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type, Authorization",
  })
);
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use("/api", router);

// app.listen(PORT, () => {
//   console.log("\x1b[33m%s\x1b[0m", "[!] Connection to database...");
//   db.on("error", (err) => {
//     console.error(err);
//   });
// });

server.listen(PORT, () => {
  console.log("Server running on port 5000");

  db.on("error", (err) => {
    console.error(err);
  });
  console.log("\x1b[33m%s\x1b[0m", "[!] Connection to database...");
});
