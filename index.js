const fs = require("fs");
const request = require("request");
const tmi = require("tmi.js");
const WebSocket = require("ws");
const mongoose = require("mongoose");
const options = require("./options");
const commands = require("./commands");
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

const client = new tmi.client(opts);

client.on("connected", (d) => {
	console.log("Connected to chat server!");
});

client.on("chat", (channel, userstate, message, self) => {
	runCommand(message, channel, userstate, self);
});

function runCommand(message, channel, userstate, self){
	const command = message.substring(1);
	const args = message.split(" ").slice(1);
	const params = {
		client,
		args,
		channel,
		userstate,
		self
	}

	// Cancel execution of function if message is not a known command.
	if(message[0] !== "!") return;
	if(commands.known.indexOf(command) === -1) return;

	commands[command](params);
}

client.connect();	