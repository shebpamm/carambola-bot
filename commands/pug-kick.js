module.exports.execute = async (client, commandContext, args, guildDocument) => {
	if (!guildDocument.pugs.pugStates.pugQueryActive) {
		commandContext.reply('No query active.');
		return;
	}

	if (!args.get('user').value) {
		commandContext.reply('Please mention user to kick.');
		return;
	}

	if (args.get('user').value === commandContext.guild.pugQueryAuthor?.id) {
		commandContext.reply('Can\'t remove query author.');
		return;
	}

	// Check that some dumbass doesn't try to remove the bot itself.
	if (args.get('user').value === commandContext.client.user.id) {
		commandContext.reply('_bruh_');
		return;
	}

	commandContext.guild.pugQueryMessage.reactions.cache.get('👍').users.remove(args.get('user').value);
	commandContext.reply('Player kicked.');
};

module.exports.config = {
	name: 'kick',
	category: 'pug',
	description: 'Kick a player from a query',
	categoryAliases: ['scrim', 'cs', 'csgo'],
	commandAliases: ['👢', 'boot', 'begone', 'kk'],
	slashEnabled: true,
	slashOptions: [{
		name: 'user',
		type: 'USER',
		description: 'User to kick',
		required: true
	}]
};
