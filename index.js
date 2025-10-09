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
app.use("/api/users", require("./controllers/userController"))
app.use("/api/projects", require("./controllers/projectController"))
app.use("/api/messages", require("./controllers/messageController"))
app.use("/api/files", require("./controllers/uploadController"))

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    
    if (err.message && err.message.includes("Invalid file type")) {
        return res.status(400).json({ error: err.message });
    }
    
    if (err.message && err.message.includes("File too large")) {
        return res.status(400).json({ error: "File is too large. Maximum size is 5MB." });
    }
    
    res.status(err.status || 500).json({
        error: err.message || "Internal Server Error"
    });
});

if(!module.parent){
	app.listen(app.get("port"), () => {
		console.log(`✅ PORT: ${app.get("port")} 🌟`);
	})
};

module.exports = app