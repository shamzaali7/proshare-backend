const express = require("express");
const app = express();
app.set("port", process.env.PORT || 4000);
const cors = require("cors");
const path = require('path');
const multer = require('multer');
const userModel = require("./models/userModel")

app.use(cors({
    origin: "*"
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
const upload = multer({ storage: storage });

app.get("/", (req, res) => {
    res.redirect("/api/projects")
});

app.get('/images', (req, res) => {
    userModel.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error', err);
        }
        else {
            res.render('imagesPage', { items: items });
        }
    });
});

app.put('/', upload.single('image'), (req, res, next) => {
 
    const newImage = {
        profilePicture: {
            data: fs.readFileSync(__dirname),
            contentType: 'image/png'
        }
    }
    userModel.findByIdAndUpdate(req.body._id, {newImage}, {new: true}, (err, item) => {
        if (err) {
            console.log(err);
        }
        else {
            res.redirect('/');
        }
    });
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