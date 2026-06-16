require('dotenv').config();
const mongoose = require("mongoose");

mongoose.set('strictQuery', false);

const mongoURI = process.env.NODE_ENV === "production"
  ? process.env.DB_URL
  : process.env.DB_URL || "mongodb://localhost:27017/proshare";

const database = mongoose.connection;

mongoose
    .connect(mongoURI)
    .then((instance) =>
        console.log(`Connected to DB: ${instance.connections[0].name}`)
    )
    .catch((error) => console.error('DB connection failed:', error));

database.on('error', (err) => console.error('MongoDB error:', err.message));
database.on('disconnected', () => console.log('MongoDB disconnected'));
database.on('open', () => console.log('✅ MongoDB connection established'));

module.exports = mongoose;