const decache = require("decache");
let { ParentEmitter, xdc } = require("./parent");

setInterval(async () => {
  console.log(`${__filename}::LISTENING`, await xdc.eth.net.isListening());
}, 1000);

ParentEmitter.on("xdc", () => {
  console.log(`[*] updating XDC onn event`);
  decache("./parent");
  xdc = require("./parent").xdc;
});
