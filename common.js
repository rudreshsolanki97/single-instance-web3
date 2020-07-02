exports.HeartBeat = (inst, dur, filename) => {
  return setInterval(async () => {
    console.log(`${__filename}::LISTENING`, await inst.eth.net.isListening());
  }, dur);
};
