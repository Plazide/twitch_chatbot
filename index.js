const fs = require("fs");
const request = require("request");
const tmi = require("tmi.js");
const WebSocket = require("ws");
const mongoose = require("mongoose");
const options = require("./options");
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
	const user = userstate["display-name"];

	console.log(`${user} sent a message in ${channel}'s channel:\n${message}`);
});

client.connect();	