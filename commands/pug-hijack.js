module.exports.execute = async (client, message, args, guildDocument) => {
	if(guildDocument.pugs.pugStates.pugQueryActive) {
		message.guild.pugQueryAuthor = message.author
		message.channel.send("You are now the author of this query.");
	} else {
		message.channel.send("No query active.");
	}
};



module.exports.config = {
	name: 'hijack',
	category: 'pug',
	categoryAliases: ['scrim', 'cs', 'csgo'],
	commandAliases: ['🤠', 'steal', 'own']
};
