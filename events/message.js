const path = require('path');
const config = require(path.join(__basedir, 'config.json'));

module.exports = async (client, mongo, message) => {
	if (message.author.bot) { // If message author is a bot, ignore.
		return;
	}

	if (message.channel.type !== 'text') { // Text is a guild text channel, so no dm's.
		return;
	}

	let guildDocument = await mongo.Guild.findOne({guildID: message.guild.id}); // Find mongoose document with guild data.

	if (!guildDocument) { // If no guildDocument is found.
		// Code is just from guildCreate
		// TODO: Refactor both this and guildCreate to use same method.
		const document = await mongo.Guild.findOneAndUpdate(
			{guildID: message.guild.id}, {guildName: message.guild.name},
			{upsert: true, new: true, setDefaultsOnInsert: true});

		document.save();
		guildDocument = document;
	}

	const usedPrefix = guildDocument.config.customPrefix || config.commandPrefix; // Check if we have a custom prefix assigned for the server.

	let isPrefixed;

	// Use different methods to compare depending if config has prefixCaseSensitive set or not.
	if (config.prefixCaseSensitive || false) {
		isPrefixed = message.content.trim().startsWith(usedPrefix);
	} else {
		isPrefixed = message.content.trim().toLowerCase().startsWith(usedPrefix.toLowerCase());
	}

	// Check if message contains wanted command prefix
	if (isPrefixed) {
		const [catg, cmd, ...args] = message.content.trim().slice(usedPrefix.length).trim().match(/(?:[^\s"]+|"[^"]*")+/g).map(a => a.replace(/^"(.+(?="$))"$/, '$1'))

		// Check if category is valid:
		const resolvedCatg = client.categories[catg] || client.categories[client.categoryAliases.get(catg)];

		if (resolvedCatg) {
			// Check if a key exists in commands or aliases and get the value(the method) from that.
			const resolvedCommand = resolvedCatg.commands.get(cmd.toLowerCase()) || resolvedCatg.commands.get(resolvedCatg.commandAliases.get(cmd.toLowerCase()));

			if (resolvedCommand) { // Found a command
				// Check if command is case sensitive, and if so return if it doesn't match.
				if (resolvedCommand.config.case_sensitive || false) {
					if (!(cmd in [resolvedCommand.config.name, ...resolvedCommand.config.commandAliases])) {
						return;
					}
				}

				//Check that the user has sufficient permissions for the command
				if(resolvedCommand.config.permissions) {
					if (!message.member.hasPermission('ADMINISTRATOR')) { //If user has the ADMINISTRATOR permission, skip permission checks.
						if (resolvedCommand.config.permissions.includes('admin')) {
							if (!message.member.roles.cache.has(guildDocument.config.admin.adminRoleID)) {
								message.channel.send("You don't have permissions to run this command.");
								return;
							}
						}
					}
				}

				// Check if command is a dev command, and deny it if the author is not a Developer.
				if (resolvedCommand.config.category === 'developer') {
					if (message.author.id !== config.developerID) {
						return;
					}
				}

				resolvedCommand.execute(client, message, args, guildDocument);
				console.log(`Executing ${resolvedCommand.config.name} command for ${message.author.tag}.`);
			} // Else console.log("Unknown command")
		} // Else console.log(`Unknown category: ${resolvedCatg} from ${catg} in ${client.categories}`);
	}
};
