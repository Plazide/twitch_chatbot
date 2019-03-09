const mongoose = require("mongoose");
const conf = require("./data/config.json");
require("dotenv").config();

const db = mongoose.connection;
const env = process.env.NODE_ENV || "development";

const mongo = conf[env].mongo;
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