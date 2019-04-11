const mongoose = require("mongoose");
const options = require("./options");

const db = mongoose.connection;

mongoose.connect(options.mongo.uri, {useNewUrlParser: true, useFindAndModify: false})
.catch(err => {
	throw new Error(err);
});

db.on("error", console.error.bind(console, "connection error:"));
db.on("open", () => {
	console.log("Connected to MongoDB!");
});