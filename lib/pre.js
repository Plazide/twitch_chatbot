const TwitchApi = require("node-twitch");
const options = require("../options");
const commands = require("./commands");

const api = new TwitchApi({
	client_id: options.twitch.client_id,
	client_secret: options.twitch.client_secret,
	isApp: true
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

function getRequiredRank(ranks, cmd){
	let requiredRank = commands.known.filter( command => {
		if(command.name === cmd){
			return true;
		}
	});
	requiredRank = ranks[requiredRank[0].perm];

	return requiredRank;
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
	const requiredRank = getRequiredRank(ranks, cmd)
	
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

function findCmdFunc(cmd){
	let res;

	for(let item of commands.known){
		if(item.name === cmd)
			res = item.func;
	}

	return res;
}

module.exports = {
	getPerms,
	isFollower,
	getRequiredRank,
	hasPermission,
	isKnownCommand,
	findCmdFunc
}