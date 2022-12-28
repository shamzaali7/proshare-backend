const express = require('express');
const app = express();
app.set("port", process.env.PORT || 4000);
const cors = require("cors");
const fetch = (...args) => {
    import("node-fetch").then(({default: fetch}) => fetch(...args));
}
const bodyParser = require('body-parser');

app.use(cors({
    origin: "*"
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.redirect("home")
});

const userController = require('./controllers/userController')
app.use("/home", userController)

if(!module.parent){
	app.listen(app.get('port'), () => {
		console.log(`✅ PORT: ${app.get('port')} 🌟`);
	})
};

const CLIENT_ID = "6539597b82efe5bb73ba";
const CLIENT_SECRET = "5b7167df2910d45ae57c245a7deb5c63a9a1ffbc"

module.exports = app