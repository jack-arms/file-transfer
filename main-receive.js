/*
send file address port [pass]

receive address port [pass]
*/
const net = require('net');
const fs = require('fs');
var program = require('commander');

program
  .arguments('<port>')
  .action(function(port) {
    var intPort = parseInt(port);
    if (!intPort || !(1024 <= intPort <= 65563)) {
      console.error('invalid port: ' + port);
      process.exit(1);
    }
    receive(intPort);
  })
  .parse(process.argv);

if (!program.args.length) {
  console.error("error: no port given. usage:");
  process.exit(1);
}

function receive(port) {
  const server = net.createServer((c) => {
    console.log('client connected');
    var file = fs.createWriteStream('client_data.txt');
    c.on('data', data => {
      console.log("received " + data.length + " bytes ");
      // console.log(data.toString());
      file.write(data);
    });
    c.on('end', () => {
      console.log('client disconnected');
    });
    // c.write('hello from server!\r\n');
    // c.end();
  });
  server.on('error', (err) => {
    throw err;
  });
  server.listen(port, 'localhost', () => {
    console.log('server bound');
    console.log('ready to receive files on port ' + port);
  });
}
