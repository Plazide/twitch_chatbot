require("dotenv").config();
//const config = require("../data/config.json");
//const env = process.env.NODE_ENV || "development";

//const options = config[env];

const options = {
	"twitch": {
		"bot_name": process.env.BOT_NAME,
		"bot_token": process.env.BOT_TOKEN,
		"client_id": process.env.CLIENT_ID,
		"client_secret": process.env.CLIENT_SECRET,
	},
	"mongo": {
		"uri": process.env.MONGODB_URI
	},
	"youtube": {
		"api_key": process.env.Y_API_KEY
	}
}

module.exports = options;