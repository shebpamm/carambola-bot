const path = require('path');
const config = require(path.join(__basedir, 'config.json'));
const commandHandler = require('../utils/commandHandler.js');
const Discord = require('discord.js')

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

	const usedPrefix = guildDocument.config.usedPrefix

	let isPrefixed;

	// Use different methods to compare depending if config has prefixCaseSensitive set or not.
	if (config.prefixCaseSensitive || false) {
		isPrefixed = message.content.trim().startsWith(usedPrefix);
	} else {
		isPrefixed = message.content.trim().toLowerCase().startsWith(usedPrefix.toLowerCase());
	}

	// Check if message contains wanted command prefix
	if (isPrefixed) {
		const [catg, cmd, ...rawArgs] = message.content.trim().slice(usedPrefix.length).trim().match(/(?:[^\s"]+|"[^"]*")+/g).map(a => a.replace(/^"(.+(?="$))"$/, '$1'))

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

				let arguments = rawArgs;
				if(resolvedCommand.config.slashEnabled && !!resolvedCommand.config.slashOptions) {

					const userIter = message.mentions.users.array()[Symbol.iterator]()
					const roleIter = message.mentions.roles.array()[Symbol.iterator]()
					const channelIter = message.mentions.channels.array()[Symbol.iterator]()

					arguments = new Discord.Collection(resolvedCommand.config.slashOptions.map((arg, i) => {

						const optionData = { name: arg.name, type: arg.type}

						let value = rawArgs[i]
						if(arg.type === 'INTEGER') value = Number.parseInt(rawArgs[i])
						if(arg.type === 'BOOLEAN') value = (rawArgs[i]?.toLowerCase() === 'true')
						if(arg.type === 'USER') {
							const user = userIter.next().value
							optionData.value = user?.id
							optionData.user = user
						}
						if(arg.type === 'ROLE') {
							const role = roleIter.next().value
							optionData.value = role?.id
							optionData.role = role
						}
						if(arg.type === 'CHANNEL') {
							const channel = channelIter.next().value
							optionData.value = channel?.id
							optionData.channel = channel
						}


						return [arg.name, optionData]
					}))
				}

				//handle rest of command checking here, when message specific parsing has been done.
				commandHandler.handleCommand(resolvedCommand, client, message, arguments, guildDocument)

			} // Else console.log("Unknown command")
		} // Else console.log(`Unknown category: ${resolvedCatg} from ${catg} in ${client.categories}`);
	}
};
