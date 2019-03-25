const TwitchApi = require("node-twitch");
const helper = require("./helper");
const options = require("../options");
const youtube = require("./youtube");
const User = require("../models/User");
const moment = require("moment");

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

async function song(params){
	const query = params.cmdArgs.join(" ");
	const channel = params.channel;
	const client = params.client;
	const chatter = params.chatter;
	const username = channel.substring(1);

	const result = await youtube.search(query);
	const entry = {
		videoId: result.id.videoId,
		title: result.snippet.title,
		duration: result.duration,
		user: chatter
	}

	results = await User.findOne({username});
	const playlist = results.playlist;

	if(!helper.inArrayObject(playlist, entry.videoId, "videoId")){
		playlist.push(entry);
		await User.findOneAndUpdate({username}, {playlist});
		client.say(channel, `@${chatter} requested: ${entry.title}`);
	}else{
		client.say(channel, `@${chatter}, the requested song is already in the playlist.`);
	}
}

async function songs(params){
	const channel = params.channel;
	const client = params.client;
	const chatter = params.chatter;
	const username = channel.substring(1);

	const result = await User.findOne({username});
	const playlist = result.playlist;
	let msg = `@${chatter}, the currently queued songs are: `;

	for(let i = 0; i < playlist.length; i++){
		const song = playlist[i];

		msg += song.title;

		// Add a comma after every title, except for the last one.
		if(i < playlist.length -1)
			msg += ", ";
	}

	client.say(channel, msg);
}

module.exports = {
	known,

	// Commands
	uptime,
	song,
	songs
}