var program = require('commander');

program
	.command('send <file> <address> <port>', 'send a file to the given address and port')
	.command('receive <port>', 'receive files on a given port')
	.parse(process.argv);