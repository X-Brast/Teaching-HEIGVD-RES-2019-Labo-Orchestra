const dgram = require('dgram');
const moment = require('moment');
const net = require('net');
const protocole = require('./orchestra-protocol');

const socketUDP = dgram.createSocket('udp4');

const allMusician = new Map();

socketUDP.bind(protocole.PROTOCOL_PORT, () => {
  console.log('Joining multicast group');
  socketUDP.addMembership(protocole.PROTOCOL_MULTICAST_ADDRESS);
});

socketUDP.on('message', (msg, source) => {
  console.log(`Data has arrived : ${msg}. Source port: ${source.port}`);

  const information = JSON.parse(msg);

  allMusician.set(information.uuid, [information.instrument, information.timestamp]);
});

const TCPserver = net.createServer();
TCPserver.listen(protocole.PROTOCOL_PORT);
TCPserver.on('connection', (TCPSocket) => {
  const payload = [];
  allMusician.forEach((value, key) => {
    if (moment().diff(value[1], 'second') >= 5) {
      allMusician.delete(key);
    } else {
      payload.push({ uuid: key, instrument: value[0], acticeSince: value[1] });
    }
  });

  TCPSocket.write(JSON.stringify(payload));
  TCPSocket.write('\r\n');
  TCPSocket.end();
});
