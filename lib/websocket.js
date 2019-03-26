const fs = require("fs");
const WebSocket = require("ws");
const https = require("https");
const http = require("http");
const { EventEmitter } = require("events");
require("dotenv").config();

const PORT = process.env.WS_PORT;
const CERT = process.env.CERT_PATH;
const KEY = process.env.KEY_PATH;
const ENV = process.env.NODE_ENV;
let server = null;

	if(ENV === "production"){
		server = new https.createServer({
			cert: fs.readFileSync(CERT, "utf8"),
			key: fs.readFileSync(KEY, "utf8")
		});
	}else if(ENV === "development"){
		server = http.createServer();
	}

class Websocket extends EventEmitter{
	constructor(){
		super();
		this.wss = new WebSocket.Server({server});
	}

	start(){
		const wss = this.wss;

		wss.on("connection", (ws) => {
			this.emit("connection", ws);

			ws.on("message", (message) => {
				const payload = JSON.parse(message);
				
				if(payload.type === "PING"){
					ws.send(JSON.stringify({type: "PONG"}));
					this.emit("pong", payload);
				}

				if(payload.type === "MESSAGE"){
					this.emit("message", payload);
				}

				if(payload.type === "LISTEN"){
					const sess_id = payload.data.sess_id;
					ws.id = sess_id;

					this.emit("listen", payload);
				}
					
			});
		});

		server.listen(PORT, () => {
			console.log("Websocket running on port", PORT);
		})
	}

	sendToAll(message){
		const wss = this.wss;

		for(let client of wss){
			const payload = {
				type: "MESSAGE",
				data: message
			}
			if(client.readyState === WebSocket.OPEN)
				client.send(JSON.stringify(payload));
		}
	}

	sendToClient(id, message){
		if(typeof message !== "object") throw new TypeError("Message type is not object.");
		const clients = this.wss.clients;

		for(let client of clients){
			if(client.id === id && client.readyState === WebSocket.OPEN){
				const payload = {
					type: "MESSAGE",
					data: message
				}

				client.send(JSON.stringify(payload));
			}	
		}
	}
}

module.exports = Websocket;
