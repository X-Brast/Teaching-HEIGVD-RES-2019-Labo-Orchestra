const dgram = require('dgram');
const uuidv4 = require('uuid/v4');
const momento = require('moment');
const protocol = require('./orchestra-protocol');

const socket = dgram.createSocket('udp4');

const instruments = {
  piano: 'ti-ta-ti',
  trumpet: 'pouet',
  flute: 'trulu',
  violin: 'gzi-gzi',
  drum: 'boum-boum',
};

function Musician(instrument) {
  this.instrument = instrument;
  this.uuid = uuidv4();

  Musician.prototype.update = function musiFunction() {
    const information = {
      timestamp: momento(),
      noise: instruments[instrument],
      instrument: this.instrument,
      uuid: this.uuid,
    };

    const payload = JSON.stringify(information);

    const message = Buffer.from(payload);

    socket.send(message, 0, message.length, protocol.PROTOCOL_PORT,
      protocol.PROTOCOL_MULTICAST_ADDRESS, () => {
        console.log(`Sending payload: ${payload} via port ${socket.address().port}`);
      });
  };

  setInterval(this.update.bind(this), 5000);
}

const instrument = process.argv[2];

if (instrument !== '') {
  // eslint-disable-next-line no-unused-vars
  const m1 = new Musician(instrument);
}
