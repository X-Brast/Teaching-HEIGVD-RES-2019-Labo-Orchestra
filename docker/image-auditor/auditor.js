const dgram = require('dgram');
const moment = require('moment');
const net = require('net');
const protocole = require('./orchestra-protocol');

const socketUDP = dgram.createSocket('udp4');

const allMusician = [];

socketUDP.bind(protocole.PROTOCOL_PORT, () => {
  console.log('Joining multicast group');
  socketUDP.addMembership(protocole.PROTOCOL_MULTICAST_ADDRESS);
});

socketUDP.on('message', (msg, source) => {
  console.log(`Data has arrived : ${msg}. Source port: ${source.port}`);

  let exist = false;

  const information = JSON.parse(msg);

  for (let i = 0; i < allMusician.length; i += 1) {
    if (allMusician[i].uuid === information.uuid) {
      exist = true;
      allMusician[i].activeSince = information.timestamp;
    }
  }

  if (!exist) {
    allMusician.push({ uuid: information.uuid, instrument: information.instrument, activeSince: information.timestamp });
  }
});

const TCPserver = net.createServer();
TCPserver.listen(protocole.PROTOCOL_PORT);
TCPserver.on('connection', (TCPSocket) => {
  const payload = [];
  for (let i = 0; i < allMusician.length; i += 1) {
    if (moment().diff(allMusician[i].activeSince, 'second') > 5) {
      allMusician.splice(i, 1);
    } else {
      payload.push(allMusician[i]);
    }
  }

  TCPSocket.write(JSON.stringify(payload));
  TCPSocket.write('\r\n');
  TCPSocket.end();
});
