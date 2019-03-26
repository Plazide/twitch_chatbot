const tmi = require("tmi.js");
const options = require("./models/options");
const commands = require("./lib/commands");
const pre = require("./lib/pre");
const User = require("./models/User");
const Websocket = require("./lib/websocket");
require("./models/mongoConnect");

async function init(){
	const users = await User.find();
	const channels = users.map( user => {return user.username});

	const opts = {
		identity: {
			username: options.twitch.bot_name,
			password: options.twitch.bot_token
		},
		connection: {
			reconnect: true
		},
		channels: channels
	};

	const client = new tmi.Client(opts);
	const websocket = new Websocket();

	client.on("connected", (d) => {
		console.log("Connected to chat server!");
	});
	
	client.on("chat", async (channel, userstate, message, self) => {
		if(self) return;
	
		const perms = await pre.getPerms(userstate, channel.substring(1));
		const args = {
			message,
			userstate,
			channel,
			perms,
			self,
			websocket
		}
	
		runCommand(args, client);
	});

	client.connect();
	websocket.start();
}

function runCommand(args, client){
	const message = args.message;
	const command = args.message.split(" ")[0].substring(1).trim();
	const perms = args.perms;
	const channel = args.channel;
	const self = args.self;
	const ws = args.websocket;
	const chatter = args.userstate["display-name"];

	// Cancel execution of function if the command is invalid in some way.
	if(message[0] !== "!") return;
	if(!pre.isKnownCommand(command)){
		client.say(channel, `The command !${command} does not exist. Type !help for a list of available commands.`);
		return;
	};
	if(!pre.hasPermission(command, perms)){
		client.say(channel, `@${chatter}, you do not have permission to use that command!`);
		return;
	}

	const cmd = pre.findCmdFunc(command);
	const cmdArgs = message.split(" ").slice(1);
	const params = {
		client,
		cmdArgs,
		channel,
		chatter,
		self,
		ws
	}

	commands[cmd](params);
}

// Start bot
init();