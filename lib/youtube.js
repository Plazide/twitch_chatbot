const options = require("../models/options");
const querystring = require("querystring");
const request = require("request-promise-native");
const apiKey = options.youtube.api_key;

function isUrl(q){
	const regexp = new RegExp(/^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+([a-zA-Z0-9_\-]{11})+$/);
	const result = regexp.test(q);

	return result;
}

function extractId(q){
	const regexp = new RegExp(/([a-zA-Z0-9_\-]{11})+$/);
	const res = regexp.exec(q);

	return res;
}

async function search(query, callback){
	const params = {
		maxResults: "1",
		part: "snippet",
		type: "video",
		q: isUrl(query) ? extractId(query) : query,
		videoCategoryID: [],
		videoDuration: "any",
		videoEmbeddable: "true",
		order: "relevance",
		key: apiKey
	};
	const options = {
		url: "https://www.googleapis.com/youtube/v3/search?"+querystring.stringify(params),
		simple: false,
		resolveWithFullResponse: true
	}
	const response = await request(options).catch( err => { throw new Error(err) });
	const body = JSON.parse(response.body);
	const result = body.items[0]
	const details = await getDetails(body.items[0].id.videoId);
	result.duration = details.items[0].contentDetails.duration;

	if(callback)
		callback(result);
	else
		return result;
}

async function getDetails(vidId, callback){
	const params = {
		part: "contentDetails",
		id: vidId,
		key: apiKey
	}
	const options = {
		url: "https://www.googleapis.com/youtube/v3/videos?"+querystring.stringify(params),
		simple: false,
		resolveWithFullResponse: true,
		method: "GET"
	}
	const response = await request(options).catch( err => { throw new Error(err) });
	const body = JSON.parse(response.body);

	if(callback)
		callback(body)
	else
		return body;
}

module.exports = {
	search
}