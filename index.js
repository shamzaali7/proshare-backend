const express = require("express");
const app = express();
app.set("port", process.env.PORT || 4000);
const cors = require("cors");
const userModel = require("./models/userModel")

app.use(cors({
    origin: "*"
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.redirect("/api/projects")
});


const userController = require("./controllers/userController")
app.use("/api/users", userController)
const projectController = require("./controllers/projectController")
app.use("/api/projects", projectController)

if(!module.parent){
	app.listen(app.get("port"), () => {
		console.log(`✅ PORT: ${app.get("port")} 🌟`);
	})
};

module.exports = app


// app.post("/upload", (req, res, next) => {
// 	let file = req.files.file
// 	const fName = req.files.file.name
// 	uploadFile.mv(
// 		`${__dirname}/public/files/${fName}`,
// 		function (err) {
// 		  if (err) {
// 			return res.status(500).send(err)
// 		  }
// 		  res.json({
// 			file: `public/${fName}`,
// 		  })
// 		},
// 	  )
// })