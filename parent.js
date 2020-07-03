const EventEmitter = require("events").EventEmitter;

const Web3 = require("web3");
const Xdc3 = require("xdc3");

const ParentEmitter = new EventEmitter();
const InternalEmitter = new EventEmitter();

/**
 * Wrapper class for the relevant functionalities
 */
class Engine {
  /**
   *
   * @param {Array<String>} url_ws list of WS
   * @param {boolean} keepAlive restart in case of failure
   * @param {Function} cb_connect callback on WS connection
   */
  constructor(
    url_ws,
    keepAlive = false,
    cb_connect = () => console.log(`[*] connected`)
  ) {
    this.heartBeatRef = null;
    this.url_ws = url_ws;
    this.allSubscriptions = [];
    this.keepAlive = keepAlive;
    this.cb_connect = cb_connect;
    this.socket_index = -1;
    this.connecting = false;
  }

  run() {
    try {
      this.initiate();
    } catch (e) {
      console.log(`exception at run: `, e);
    }
  }

  heartBeat() {
    this.heartBeatRef = setInterval(async () => {
      console.log(`running:`, await this.xdc.eth.net.isListening());
    }, 1000);
  }

  subscribe(event, cb) {
    let ref = this.xdc.eth.subscribe(event);
    ref.on("connected", () => {
      console.log(`subcription connected: ${event}`);
    });
    ref.on("data", cb);
    ref.on("error", (err) => {
      console.log(`subcription error:${event}::`, err);
    });
    ref.on("connected", () => {
      console.log(`subcription connected: ${event}`);
    });
    this.updateOrAddSubsription(event, ref, cb);
  }

  closeConnection() {
    console.log("called closed connection");
    this.provider.disconnect();
  }

  reconnectAllSubscription() {
    this.clearAllSubscription().then(() => {
      for (let i = 0; i < this.allSubscriptions.length; i++) {
        this.subscribe(
          this.allSubscriptions[i].name,
          this.allSubscriptions[i].cb
        );
      }
    });
  }

  updateOrAddSubsription(name, ref, cb) {
    for (let i = 0; i < this.allSubscriptions.length; i++) {
      if (this.allSubscriptions[i].name === name) {
        this.allSubscriptions[i].ref = ref;
        this.allSubscriptions[i].cb = cb;
        return;
      }
    }
    this.allSubscriptions.push({ name, ref, cb });
  }

  clearSubscription(event) {
    try {
      for (let i = 0; i < this.allSubscriptions.length; i++) {
        if (this.allSubscriptions[i].name === event) {
          this.allSubscriptions[i].ref.unsubscribe();
          break;
        }
      }
    } catch (e) {
      console.log(`[*] error while clearing a subcription: ${event}:`, e);
    }
  }

  async clearAllSubscription() {
    try {
      let connectionActive = await this.xdc.eth.net.isListening();
      console.log("connection active::", connectionActive);

      if (connectionActive !== true) return;
      for (let i = 0; i < this.allSubscriptions.length; i++) {
        this.allSubscriptions[i].ref.unsubscribe();
      }
      console.log(`[*] cleared subscriptions`);
    } catch (e) {
      // error while unsubscribing ( mostly timeout )
      console.log(
        `[*] error while clearing all subcription::`,
        this.allSubscriptions.map((ele) => {
          return ele.name;
        }),
        e
      );
    }
  }

  initiate(restart = false) {
    try {
      if (this.connecting === true) return;
      this.connecting = true;
      this.socket_index = (this.socket_index + 1) % this.url_ws.length;
      console.log(
        "[*] called initiate; using socket index:",
        this.socket_index
      );

      this.provider = new Xdc3.providers.WebsocketProvider(
        this.url_ws[this.socket_index]
      );
      this.xdc = new Xdc3(this.provider);

      this.provider.on("connect", () => {
        console.log(`@@@@ connected`);
        this.connecting = false;
        this.cb_connect(this.xdc);
        this.heartBeat();

        if (restart === true) {
          this.reconnectAllSubscription();
        }
      });

      this.provider.on("error", (e) => {
        console.log(`@@@@ error::`, e);
      });

      this.provider.on("close", () => {
        console.log(`@@@@ disconected`);
      });

      this.provider.on("end", () => {
        console.log(`@@@@ end`);
        if (this.keepAlive === true) {
          this.reinitiate();
        } else {
          this.destroy();
        }
      });
    } catch (e) {
      console.log(e);
      this.destroy();
    }
  }

  reinitiate() {
    if (this.connecting === false) {
      console.log("[*] called re-initiate");
      clearInterval(this.heartBeatRef);
      this.clearAllSubscription()
        .then(() => {
          this.closeConnection();
          this.initiate(true);
        })
        .catch((e) => {
          console.log(`error at reinitiate::`, e);
        });
    }
  }

  destroy() {
    clearInterval(this.heartBeatRef);
    this.clearAllSubscription().then(() => {
      this.closeConnection();
    });
  }
}

const XdcWs = process.env.XdcWs.split(",");

let engine = new Engine(XdcWs, (keepAlive = true), () => {
  InternalEmitter.emit("xdc");
});
engine.run();
engine.subscribe("newBlockHeaders", (data) =>
  console.log("@@data::", data.number)
);

/**
 * Code to imitiate disconnection
 */
// setInterval(() => {
//   engine.closeConnection();
// }, 15000);

InternalEmitter.on("xdc", () => {
  exports.xdc = engine.xdc;
  ParentEmitter.emit("xdc");
});

exports.xdc = engine.xdc;
exports.ParentEmitter = ParentEmitter;
