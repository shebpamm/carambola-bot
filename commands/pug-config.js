module.exports.execute = async function (client, commandContext, args, guildDocument) {
	if (args.length === 0) {
		commandContext.channel.send('//TODO'); // TODO: Add a help print after you have implemented the help printing lol
	} else if (args.length === 1) { // Print out the current value
		if (['role', 'mention'].includes(args[0])) { // Check if args[0] is either role or mention
			const currentRole = await commandContext.guild.roles.fetch(guildDocument.config.pugs.pugUserRoleID || ''); // Try to resolve the RoleId found in db.
			// If role is found, send message. Otherwise print no pug role.
			if (currentRole.id) {
				commandContext.channel.send(`Currently assigned pug role: **${currentRole.name}**`, {allowedMentions: {parse: []}});
			} else {
				commandContext.channel.send(`No pug role assigned.\nAssign one with:\n\`${guildDocument.config.usedPrefix} pug config role @<role>\``);
			}
		}

		if (['activeRole'].includes(args[0])) { // Check if args[0] is either role or mention
			const currentRole = await commandContext.guild.roles.fetch(guildDocument.config.pugs.pugActiveRoleID || ''); // Try to resolve the RoleId found in db.
			// If role is found, send message. Otherwise print no pug role.
			if (currentRole.id) {
				commandContext.channel.send(`Currently assigned active role: **${currentRole.name}**`, {allowedMentions: {parse: []}});
			} else {
				commandContext.channel.send(`No active role assigned.\nAssign one with:\n\`${guildDocument.config.usedPrefix} pug config activeRole @<role>\``);
			}
		}

		if (['channel', 'feed'].includes(args[0])) {
			// Try to resolve current channel.
			const currentChannel = await commandContext.guild.channels.resolve(guildDocument.config.pugs.pugChannelID);
			// If found, send message. Otherwise print no pug channel.
			if (currentChannel) {
				commandContext.channel.send(`Currently assigned pug channel: **${currentChannel.name}**`, {allowedMentions: {parse: []}});
			} else {
				commandContext.channel.send(`No pug channel assigned.\nAssign one with:\n\`${guildDocument.config.usedPrefix} pug config channel #<channel>\``);
			}
		}

		if (args[0] === 'pingOnQuery') {
			commandContext.channel.send(`Pinging on query is currently set to **${guildDocument.config.pugs.pugPingOnQuery}**`);
		}

		if (args[0] === 'useActiveRole') {
			commandContext.channel.send(`Active role assigning is currently set to **${guildDocument.config.pugs.useActiveRole}**`);
		}
	} else if (args.length === 2) { // Set a new value
		if (['role', 'mention'].includes(args[0])) {
			if (commandContext.mentions.roles.size === 1) { // Check that the message contains exactly one role mention.
				guildDocument.config.pugs.pugUserRoleID = commandContext.mentions.roles.first().id;
				guildDocument.save();
				commandContext.channel.send('New role assigned successfully.');
			}
		}

		if (['activeRole'].includes(args[0])) {
			if (commandContext.mentions.roles.size === 1) { // Check that the message contains exactly one role mention.
				guildDocument.config.pugs.pugActiveRoleID = commandContext.mentions.roles.first().id;
				guildDocument.save();
				commandContext.channel.send('Active role assigned successfully.');
			}
		}

		if (['channel', 'feed'].includes(args[0])) {
			if (commandContext.mentions.channels.size === 1) { // Check that the message contains exactly one channel mention.
				if (commandContext.mentions.channels.first().type === 'text') { // Additionally check that the channel is a text channel.
					guildDocument.config.pugs.pugChannelID = commandContext.mentions.channels.first().id;
					guildDocument.save();
					commandContext.channel.send('New channel assigned successfully.');
				} else {
					commandContext.channel.send('Invalid Channel. Please use a text channel.');
				}
			}
		}

		if (args[0] === 'pingOnQuery') {
			if (args[1].toLowerCase() === 'false') {
				guildDocument.config.pugs.pugPingOnQuery = false;
				guildDocument.save();
				return commandContext.channel.send('Option changed successfully.');
			}

			if (args[1].toLowerCase() === 'true') {
				guildDocument.config.pugs.pugPingOnQuery = true;
				guildDocument.save();
				return commandContext.channel.send('Option changed successfully.');
			}

			return commandContext.channel.send('Incorrect value.');
		}

		if (args[0] === 'useActiveRole') {
			if (args[1].toLowerCase() === 'false') {
				guildDocument.config.pugs.useActiveRole = false;
				guildDocument.save();
				return commandContext.channel.send('Option changed successfully.');
			}

			if (args[1].toLowerCase() === 'true') {
				guildDocument.config.pugs.useActiveRole = true;
				guildDocument.save();
				return commandContext.channel.send('Option changed successfully.');
			}

			return commandContext.channel.send('Incorrect value.');
		}
	}
};

module.exports.config = {
	name: 'config',
	category: 'pug',
	categoryAliases: ['scrim', 'cs', 'csgo'],
	commandAliases: ['cfg']
};
