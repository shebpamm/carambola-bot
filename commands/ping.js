module.exports.execute = async (client, message, args, guildDocument) => {
	message.reply('Pong!');
};

module.exports.config = {
	name: 'ping',
	category: 'developer',
	category_aliases: ['dev', 'd'],
	command_aliases: ['p']
};
