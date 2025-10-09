const express = require("express");
const app = express();
app.set("port", process.env.PORT || 4000);
const cors = require("cors");
const userModel = require("./models/userModel")

app.use(cors({
    origin: "*"
}))
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.get("/", (req, res) => {
    res.redirect("/api/projects")
});

// API Routes
const userController = require("./controllers/userController")
const projectController = require("./controllers/projectController")
const messageController = require("./controllers/messageController")
const filesController = require("./controllers/uploadController")

app.use("/api/users", userController)
app.use("/api/projects", projectController)
app.use("/api/messages", messageController)
app.use("/api/files", filesController)

if(!module.parent){
	app.listen(app.get("port"), () => {
		console.log(`✅ PORT: ${app.get("port")} 🌟`);
	})
};

module.exports = app