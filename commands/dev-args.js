module.exports.execute = async (client, message, args, guildDocument) => {
	message.channel.send(args + "​");
};

module.exports.config = {
	name: 'args',
	category: 'developer',
	categoryAliases: ['dev', 'd'],
	commandAliases: ['arg']
};
