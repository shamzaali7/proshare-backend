const mongoose = require("mongoose")
require("dotenv").config();
mongoose.set('strictQuery', false)
mongoose.Promise = Promise;

let mongoURI = process.env.DB_URL
const database = mongoose.connection;


mongoose
    .connect(mongoURI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then((instance) => 
    console.log(`connected to db: ${instance.connections[0].name}`)
    )
    .catch((error) => console.log('Connection failed!', error));
    
database.on('error', (err) => console.log(err.message + ' is Mongosh not running?'));
database.on('connected', () => console.log('mongo connected at: ', mongoURI));
database.on('disconnected', () => console.log('mongo disconnected'));

database.on('open', () => {
	console.log('✅ mongo connection made!');
});

module.exports = mongoose