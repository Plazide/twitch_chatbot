const options = require("../options");
const querystring = require("querystring");
const request = require("request-promise-native");
const apiKey = options.youtube.api_key;

async function search(query, callback){
	const params = {
		maxResults: "1",
		part: "snippet",
		type: "video",
		q: query,
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

	if(callback)
		callback(body);
	else
		return body;
}

module.exports = {
	search
}