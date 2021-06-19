module.exports.execute = async (client, commandContext, args, guildDocument) => {
	if(guildDocument.pugs.pugStates.pugQueryActive) {
		commandContext.guild.pugQueryAuthor = commandContext.author
		commandContext.reply(`${commandContext.author} is now the author of this query.`);
	} else {
		commandContext.reply("No query active.");
	}
};



module.exports.config = {
	name: 'hijack',
	category: 'pug',
	description: 'Make yourself the author of the current query!',
	categoryAliases: ['scrim', 'cs', 'csgo'],
	commandAliases: ['🤠', 'steal', 'own'],
	slashEnabled: true
};
