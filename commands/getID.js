module.exports.execute = async (client, message, args, guildDocument) => {
	message.reply(`Your ID is \`${message.author.id}\``);
};

module.exports.config = {
	name: 'getID',
	category: 'developer',
	categoryAliases: ['dev', 'd'],
	commandAliases: ['userID']
};
