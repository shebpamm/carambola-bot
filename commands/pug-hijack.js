module.exports.execute = async (client, message, args, guildDocument) => {
	if(guildDocument.pugs.pugStates.pugQueryActive) {
		message.guild.pugQueryAuthor = message.author
		message.reply(`${message.author} is now the author of this query.`);
	} else {
		message.reply("No query active.");
	}
};



module.exports.config = {
	name: 'hijack',
	category: 'pug',
	categoryAliases: ['scrim', 'cs', 'csgo'],
	commandAliases: ['🤠', 'steal', 'own']
};
