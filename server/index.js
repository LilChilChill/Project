const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const userRoute = require('./Routes/userRoute');
const path = require('path'); 

const app = express();
require('dotenv').config();

app.use(express.json());
app.use(cors());
app.use("/api/users", userRoute);

app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

const port = process.env.PORT || 5000;
const uri = process.env.ATLAS_URI;

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});

mongoose.connect(uri)
    .then(() => console.log(`MongoDB connection established`))
    .catch((error) => console.log("MongoDB connection error:", error.message));
