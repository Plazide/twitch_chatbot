const TwitchApi = require("node-twitch");
const helper = require("./helper");
const options = require("../options");

const known = require("../models/KnownCommands.json");
const app = new TwitchApi({
	client_id: options.twitch.client_id,
	client_secret: options.twitch.client_secret,
	isApp: true
});

function uptime(params){
	if(!params.channel) throw new Error("Missing param: channel");
	if(!params.client) throw new Error("Missing param: client");

	const channel = params.channel;
	const client = params.client;
	const user = channel.substring(1);

	app.getStreams({channels: user}, body => {
		const stream = body.data[0];
		
		if(!stream){
			client.say(channel, "The stream is offline, so there is no uptime.");
			return;
		}

		const start = new Date(stream.started_at).getTime();
		const now = new Date().getTime();
		const uptime = now - start;
		const timeDisplay = helper.ms2Literal(uptime);
		const msg = `${stream.user_name} has been streaming for ${timeDisplay}`;

		client.say(channel, msg);
	});	
}

module.exports = {
	known,

	// Commands
	uptime
}