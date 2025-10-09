const express = require("express");
const app = express();
const cors = require("cors");

app.set("port", process.env.PORT || 4000);

const allowedOrigins = [
  "http://localhost:3000",
  "https://main--proshares.netlify.app" 
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.get("/", (req, res) => {
  res.redirect("/api/projects");
});

const userController = require("./controllers/userController");
const projectController = require("./controllers/projectController");
const messageController = require("./controllers/messageController");
const filesController = require("./controllers/uploadController");

app.use("/api/users", userController);
app.use("/api/projects", projectController);
app.use("/api/messages", messageController);
app.use("/api/files", filesController);

if (!module.parent) {
  app.listen(app.get("port"), () => {
    console.log(`✅ PORT: ${app.get("port")} 🌟`);
  });
}

module.exports = app;
