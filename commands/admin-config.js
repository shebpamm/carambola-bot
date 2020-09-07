module.exports.execute = async (client, message, args, guildDocument) => {

	if (args.length === 0) {
		message.channel.send('//TODO'); // TODO: Add a help print after you have implemented the help printing lol

	} else if (args.length === 1) { // Print out the current value
		if (['role', 'mention'].includes(args[0])) { // Check if args[0] is either role or mention
			const currentRole = await message.guild.roles.fetch(guildDocument.config.admin.adminRoleID || ''); // Try to resolve the RoleId found in db.
			// If role is found, send message. Otherwise print no pug role.
			if (currentRole.id) {
				message.channel.send(`Currently assigned admin role: **${currentRole.name}**`);
			} else {
				message.channel.send('No admin role assigned.\nAssign one with:\n`admin config role @<role>`');
			}
		}
	} else if (args.length === 2) { // Set a new value
		if (['role', 'mention'].includes(args[0])) {
			if (message.mentions.roles.size === 1) { // Check that the message contains exactly one role mention.
				guildDocument.config.admin.adminRoleID = message.mentions.roles.first().id;
				guildDocument.save();
				message.channel.send('New role assigned successfully.');
			}
		}
	}
};

module.exports.config = {
	name: 'config',
	category: 'admin',
	categoryAliases: ['op', 'mod', 'moderator'],
	commandAliases: ['cfg'],
	permissions: ['admin']
};
