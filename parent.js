const _ = require("lodash");
const EventEmitter = require("events").EventEmitter;

const Web3 = require("web3");
const Xdc3 = require("xdc3");

const ParentEmitter = new EventEmitter();

let providerWS = new Xdc3.providers.WebsocketProvider(
  "wss://ws.xinfin.network"
);
let xdc = new Xdc3(providerWS);

setTimeout(() => {
  providerWS.disconnect();
  setTimeout(() => {
    providerWS = new Xdc3.providers.WebsocketProvider(
      "wss://ws.xinfin.network"
    );
    xdc = new Xdc3(providerWS);
    providerWS.on("connect", () => {
      ParentEmitter.emit("xdc");
    });
  }, 2000);
}, 5000);

setInterval(async () => {
  console.log(`${__filename}::LISTENING`, await xdc.eth.net.isListening());
}, 1000);

exports.xdc = xdc;
exports.ParentEmitter = ParentEmitter;
