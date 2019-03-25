const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	username: String,
	display_name: String,
	profile_img: String,
	sess_id: String,
	access_token: String,
	refresh_token: String,
	created: Date,
	last_login: Date,
	playlist: [
		{
			title: String,
			videoId: String,
			duration: Number,
			user: String,
			added: {type: Date, default: Date.now}
		}
	]
});

const user = mongoose.model("user", userSchema);

module.exports = user;