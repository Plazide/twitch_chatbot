const fs = require("fs");
const request = require("request");
const tmi = require("tmi.js");
const WebSocket = require("ws");
const mongoose = require("mongoose");
const TwitchApi = require("node-twitch");
const options = require("./options");
const commands = require("./lib/commands");
require("./mongoConnect");

const opts = {
	identity: {
		username: options.twitch.bot_name,
		password: options.twitch.bot_token
	},
	connection: {
		reconnect: true
	},
	channels: ["iamstreaming"]
};

const client = new tmi.Client(opts);
const api = new TwitchApi({
	client_id: options.twitch.client_id,
	client_secret: options.twitch.client_secret,
	isApp: true
});

client.on("connected", (d) => {
	console.log("Connected to chat server!");
});

client.on("chat", async (channel, userstate, message, self) => {
	if(self) return;

	const perms = await getPerms(userstate, channel.substring(1));
	const args = {
		message,
		userstate,
		channel,
		perms,
		self
	}

	runCommand(args);
});

async function getPerms(userstate, channel){
	const perms = {
		broadcaster: userstate.badges.broadcaster ? true : false,
		mod: userstate.badges.moderator ? true : false,
		sub: userstate.badges.subscriber ? true : false,
		follower: await isFollower(userstate["user-id"], channel),
		vip: userstate.badges.vip ? true : false
	}

	return perms;
}

async function isFollower(user, channel){
	let isFollower = null;

	const result = await api.getUsers(channel);
	const channel_id = result.data[0].id;
	
	const options = {
		from_id: user,
		to_id: channel_id
	}

	const follows = await api.getFollows(options);

	if(follows.data.length > 0)
		isFollower = true;
	else
		isFollower = false;

	return isFollower;
}

function hasPermission(cmd, perms){
	let rank = 0;
	const ranks = {
		all: 0,
		vip: 1,
		follower: 2,
		sub: 3,
		mod: 4,
		broadcaster: 5
	}
	const requiredRank = commands.known.map( command => {
		if(command.name === cmd){
			return ranks[command.perm];
		}
	})[0];

	
	Object.keys(perms).forEach( key => {
		const hasPerm = perms[key];
		if(hasPerm){
			const thisRank = ranks[key];
			if(thisRank > rank)
				rank = thisRank;
		}	
	});

	if(rank >= requiredRank)
		return true;
	else	
		return false;
}

function isKnownCommand(cmd){
	let result = false;

	commands.known.forEach( (known) => {
		if(known.name === cmd)
			result = true;
	});

	return result;
}

function runCommand(args){
	const message = args.message;
	const command = args.message.substring(1);
	const perms = args.perms;
	const channel = args.channel;
	const self = args.self;
	const chatter = args.userstate["display-name"];

	// Cancel execution of function if the command is invalid in some way.
	if(message[0] !== "!") return;
	if(!isKnownCommand(command)){
		client.say(channel, `The command !${command} does not exist. Type !help for a list of available commands.`);
		return;
	};
	if(!hasPermission(command, perms)){
		client.say(channel, `@${chatter}, you do not have permission to use that command!`);
		return;
	}


	const cmdArgs = message.split(" ").slice(1);
	const params = {
		client,
		cmdArgs,
		channel,
		self
	}

	commands[command](params);
}

client.connect();	