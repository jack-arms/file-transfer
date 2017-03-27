/*
send file address port [pass]

receive address port [pass]
*/
const net = require('net');
const fs = require('fs');
var program = require('commander');

program
	.arguments('<file> <address> <port>')
	.action(function(file, address, port) {
		var intPort = parseInt(port);
	    if (!intPort || !(1024 <= intPort <= 65563)) {
	      console.error('invalid port: ' + port);
	      process.exit(1);
	    }
	    send(file, address, port);
	})
	.parse(process.argv)

if (!program.args.length) {
	console.log("error. usage:");
	process.exit(1);
}

function send(file, address, port) {
	var client = new net.Socket();
	var options = {port: port, address: address};
	client.retryAttempts = 10;
	client.retryTimeout = 1000;

	function connectFunc() {
		console.log('connected to server!');
		console.log(`sending ${file} to server.`);
		let inFile = fs.createReadStream(file);
		inFile.pipe(client);
		inFile.on('end', () => {
			console.log('file read.');
			client.done = true;
			client.end();
		})
	}

	console.log('connecting to: ', options);
	client.connect(options);
	client.on('connect', connectFunc);
	client.on('data', (data) => {
		console.log('from server: ' + data.toString());
	});
	client.on('error', (err) => {
		if (err.code == 'ECONNREFUSED') {
		    console.log('connection refused.');
		} else {
			console.log('other error: ' + err.code);
		}
		client.error = err;
	});
	client.on('end', function() {
		console.log('connection ended.');
		// client.destroy();
	});
	client.on('close', function() {
	    console.log('Connection closed');
	    if (!client.done && client.retryAttempts > 0) {
	    	client.retryAttempts--;
	    	console.log('Trying again in ' + client.retryTimeout + 'ms...');
	    	setTimeout(function() {
		    	console.log('connecting to: ', options);
		        client.connect(options);
		    }, client.retryTimeout);
	    }
	});
}