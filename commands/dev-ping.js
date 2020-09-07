module.exports.execute = async (client, message, args, guildDocument) => {
	message.reply('Pong!');
};

module.exports.config = {
	name: 'ping',
	category: 'developer',
	categoryAliases: ['dev', 'd'],
	commandAliases: ['p']
};
