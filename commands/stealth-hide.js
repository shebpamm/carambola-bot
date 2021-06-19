module.exports.execute = async (client, commandContext, args, guildDocument) => {
	// Const hiddenVoiceRole = message.guild.roles.fetch(guildDocument.config.stelth.hiddenVoiceRoleID || '');
	const hiddenChannel = commandContext.guild.channels.resolve(guildDocument.config.stealth.hiddenVoiceID);
	console.log(hiddenChannel);

	if (guildDocument.config.stealth.hiddenVoiceRoleID && hiddenChannel) {
		if (commandContext.member.roles.cache.has(guildDocument.config.stealth.hiddenVoiceRoleID)) {
			// Fetch all members in voice with command issuer
			const targetMembers = commandContext.guild.voiceStates.resolve(commandContext.author.id).channel.members;
			targetMembers.forEach(m => m.edit({channel: hiddenChannel}));
		}
	} else {
		commandContext.author.send('Please configure a stealth channel and role.');
	}

	commandContext.delete();
};

module.exports.config = {
	name: 'hide',
	category: 'stealth',
	categoryAliases: ['sth', 'secret'],
	commandAliases: ['hd']
};
