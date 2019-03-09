const mongoose = require("mongoose");
const options = require("./options");

const db = mongoose.connection;
const env = process.env.NODE_ENV || "development";

const mongo = options.mongo;
const user = mongo.user;
const pwd = mongo.pwd;
const db_name = mongo.db_name;
const server = mongo.server;

const url = `mongodb://${user}:${pwd}@${server}/${db_name}?authSource=admin`;

mongoose.connect(url, {useNewUrlParser: true})
.catch(err => {
	throw new Error(err);
});

db.on("error", console.error.bind(console, "connection error:"));
db.on("open", () => {
	console.log("Connected to MongoDB!");
});