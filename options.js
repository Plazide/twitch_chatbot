require("dotenv").config();
const config = require("./data/config.json");
const env = process.env.NODE_ENV || "development";

const options = config[env];

module.exports = options;