module.exports.execute = async (client, commandContext, args, guildDocument) => {
	commandContext.reply(`Your ID is \`${commandContext.author.id}\``);
};

module.exports.config = {
	name: 'getID',
	category: 'developer',
	categoryAliases: ['dev', 'd'],
	commandAliases: ['userID']
};
