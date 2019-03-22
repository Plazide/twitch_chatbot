const moment = require("moment");

function ms2Literal(ms){
	/* const secs = Math.floor(ms / 1000);
	const minutes = Math.floor(secs / 60);
	const hours = minutes / 60; */

	//console.log("Minutes:", minutes % secs);
	const mom = moment(ms).utcOffset(0);
	const hours = mom.format("H");
	const minutes = mom.format("m");
	const seconds = mom.format("s");

	const hourDisplay = hours > 0 ? `${hours} ${hours == 1 ? "hour" : "hours"}` : "";
	const minuteDisplay = minutes > 0 ? `${minutes} ${minutes == 1 ? "minute" : "minutes"}` : "";
	const secondDisplay = `${seconds} ${seconds == 1 ? "second" : "seconds"}`;

	/* const time = moment(ms).format("kk \hour\s, mm minutes and ss seconds");
	console.log(hours); */
	const time = `${hourDisplay}, ${minuteDisplay}, and ${secondDisplay}`;

	return time;
}

module.exports = {
	ms2Literal
}