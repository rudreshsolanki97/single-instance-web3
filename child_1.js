let { ParentEmitter } = require("./parent");

let heartbeatRef = null,
  xdc;

function HeartBeat() {
  clearInterval(heartbeatRef);
  heartbeatRef = setInterval(async () => {
    try {
      console.log(`${__filename}::LISTENING`, await xdc.eth.net.isListening());
    } catch (e) {
      console.log(`error:: child:`, e);
    }
  }, 1000);
}

ParentEmitter.on("xdc", () => {
  console.log(`[*] updating XDC onn event @@@@@@@@@@@@@@@@`);
  /**
   * no need to bust cache
   */
  xdc = require("./parent").xdc;
  HeartBeat();
});

/**
 * Subscribtions
 */

/**
 * Initiations
 */
