module.exports.execute = async (client, commandContext, args, guildDocument) => {
	if (args.length === 0) {
		commandContext.channel.send('//TODO'); // TODO: Add a help print after you have implemented the help printing lol
	} else if (args.length === 1) { // Print out the current value
		if (['role', 'mention'].includes(args[0])) { // Check if args[0] is either role or mention
			const currentRole = await commandContext.guild.roles.fetch(guildDocument.config.stealth.hiddenVoiceRoleID || ''); // Try to resolve the RoleId found in db.
			// If role is found, send message. Otherwise print no pug role.
			if (currentRole.id) {
				commandContext.author.send(`Currently assigned hidden role: **${currentRole.name}**`);
			} else {
				commandContext.author.send('No hidden role assigned.\nAssign one with:\n`stealth config role @<role>`');
			}
		}

		if (['channel', 'feed'].includes(args[0])) {
			// Try to resolve current channel.
			const currentChannel = await commandContext.guild.channels.resolve(guildDocument.config.stealth.hiddenVoiceID);
			// If found, send message. Otherwise print no pug channel.
			if (currentChannel) {
				commandContext.author.send(`Currently assigned hidden channel: **${currentChannel.name}**`, {allowedMentions: {parse: []}});
			} else {
				commandContext.author.send('No hidden channel assigned.\nAssign one with:\n`pug config channel #<channel>`');
			}
		}
	} else if (args.length === 2) { // Set a new value
		if (['role', 'mention'].includes(args[0])) {
			if (commandContext.mentions.roles.size === 1) { // Check that the message contains exactly one role mention.
				guildDocument.config.stealth.hiddenVoiceRoleID = commandContext.mentions.roles.first().id;
				guildDocument.save();
				commandContext.author.send('New role assigned successfully.');
			}
		}

		if (['channel', 'voice'].includes(args[0])) {
			const hiddenChannel = commandContext.guild.channels.resolve(args[1]);

			if (hiddenChannel) { // Check that the message contains exactly one channel mention.
				guildDocument.config.stealth.hiddenVoiceID = hiddenChannel.id;
				guildDocument.save();
				commandContext.author.send('New channel assigned successfully.');
			} else {
				commandContext.author.send('Invalid channel ID.');
			}
		}
	}

	commandContext.delete();
};

module.exports.config = {
	name: 'config',
	category: 'stealth',
	categoryAliases: ['sth', 'secret'],
	commandAliases: ['cfg']
};
