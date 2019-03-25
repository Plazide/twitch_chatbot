const TwitchApi = require("node-twitch");
const helper = require("./helper");
const options = require("../models/options");
const youtube = require("./youtube");
const User = require("../models/User");

const known = require("../models/KnownCommands.json");
const twitch = new TwitchApi({
	client_id: options.twitch.client_id,
	client_secret: options.twitch.client_secret,
	isApp: true
});

async function uptime(params){
	if(!params.channel) throw new Error("Missing param: channel");
	if(!params.client) throw new Error("Missing param: client");

	const channel = params.channel;
	const client = params.client;
	const user = channel.substring(1);

	const streams = await twitch.getStreams({channels: user});
	const stream = streams.data[0];
	
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
}

async function song(params){
	const query = params.cmdArgs.join(" ");
	const channel = params.channel;
	const client = params.client;
	const chatter = params.chatter;
	const username = channel.substring(1);

	const streams = await twitch.getStreams({channels: username});
	
	if(streams.data.length === 0){
		client.say(channel, `@${chatter}, song requests don't work while the stream is offline.`);
		return;
	}

	const result = await youtube.search(query);
	const entry = {
		videoId: result.id.videoId,
		title: helper.htmlDecode(result.snippet.title),
		duration: helper.iso2ms(result.duration),
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

	if(playlist.length > 0){
		for(let i = 0; i < playlist.length; i++){
			const song = playlist[i];

			msg += song.title;

			// Add a comma after every title, except for the last one.
			if(i < playlist.length -1)
				msg += ", ";
		}
	}else{
		msg = `@${chatter}, the playlist is empty! Use the !song command to add new songs!`
	}
		

	client.say(channel, msg);
}

async function clearsongs(params){
	const channel = params.channel;
	const client = params.client;
	const chatter = params.chatter;
	const username = channel.substring(1);

	const playlist = [];
	const current = await User.findOneAndUpdate({username}, {playlist});
	const newer = await User.findOne({username});
	let msg = `@${chatter}, `;

	if(current.playlist.length === 0){
		msg += "the playlist is already empty!";
	}else if(newer.playlist.length === 0){
		msg += "the playlist was cleared!";
	}else if(newer.playlist.length > 0){
		msg += "it seems like something went wrong. The playlist was not cleared!";
	}
	
	client.say(channel, msg);
}

async function help(params){
	const channel = params.channel;
	const client = params.client;
	const chatter = params.chatter;
	const args = params.cmdArgs;

	if(args.length === 0){
		let msg = `@${chatter}, type !help before any of the following commands to learn more about them: `;

		for(let i = 0; i < known.length; i++){
			const item = known[i];

			msg += `!${item.name}`;

			if(i < known.length-1)
				msg += ", ";
		}

		client.say(channel, msg);
	}else{
		const arg = args[0];
		const cmd = arg[0] === "!" ? arg.substring(1) : arg;
		let msg = "";

		for(let item of known){
			if(item.name === cmd)
				msg += item.help;
		}

		client.say(channel, `@${chatter}, !${cmd} ${msg}`);
	}
}

async function regretsong(params){
	const channel = params.channel;
	const client = params.client;
	const chatter = params.chatter;
	const username = channel.substring(1);

	const user = await User.findOne({username});
	const playlist = user.playlist;
	let msg = `@${chatter}, `;
	let foundOne = false;
	let title = "";

	for(let song of playlist){
		if(song.user === chatter){
			let i = playlist.indexOf(song);
			playlist.splice(i, 1);
			title = song.title;
			foundOne = true;
			break;
		}	
	}

	if(!foundOne){
		msg += "you have not requested any songs, nothing was removed.";
	}else{
		await User.findOneAndUpdate({username}, {playlist});
		msg += `${title} was removed from the playlist.`;
	}

	client.say(channel, msg);
}

module.exports = {
	known,

	// Commands
	uptime,
	song,
	songs,
	clearsongs,
	help,
	regretsong
}