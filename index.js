const express = require("express");
const app = express();
app.set("port", process.env.PORT || 4000);
const cors = require("cors");

app.use(cors({
    origin: "*"
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.get("/", (req, res) => {
//     res.redirect("home")
// });

const userController = require("./controllers/userController")
app.use("/users", userController)
const projectController = require("./controllers/projectController")
app.use("/projects", projectController)

if(!module.parent){
	app.listen(app.get("port"), () => {
		console.log(`✅ PORT: ${app.get("port")} 🌟`);
	})
};

module.exports = app


// const fetch = (...args) => {
//     import("node-fetch").then(({default: fetch}) => fetch(...args));
// }
// const bodyParser = require("body-parser");
// app.get("/getAccessToken", async function(req, res){
//     console.log(req.query.code, CLIENT_ID, CLIENT_SECRET);
//     // const params = "?client_id=" + CLIENT_ID + "&client_secret=" + CLIENT_SECRET + "&code=" + req.query.code;
//     await fetch(`https://github.com/login/oauth/access_token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${req.query.code}`, {
//         method: "POST",
//         headers: {
//             "Accept":  "application/json"
//         }
//     })
//     .then((response) => {response.json()})
//     .then((data) => {
//         console.log(data)
//         res.json(data)
//     });
// });
// app.get("/getUserData", async function(req, res){
//     req.get("Authorization");
//     await fetch("https://api.github.com/user", {
//         method: "GET",
//         headers: {
//             "Authorization" : req.get("Authorization")
//         }
//     }).then((response) => {
//         return response.json()
//     }).then((data) => {
//         console.log(data)
//         res.json(data)
//     })
// })