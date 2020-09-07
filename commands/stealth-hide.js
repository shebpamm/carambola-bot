module.exports.execute = async (client, message, args, guildDocument) => {

	//const hiddenVoiceRole = message.guild.roles.fetch(guildDocument.config.stelth.hiddenVoiceRoleID || '');
	const hiddenChannel = message.guild.channels.resolve(guildDocument.config.stealth.hiddenVoiceID);
	console.log(hiddenChannel)

	if (guildDocument.config.stealth.hiddenVoiceRoleID && hiddenChannel) {
		if (message.member.roles.cache.has(guildDocument.config.stealth.hiddenVoiceRoleID)) {

			//Fetch all members in voice with command issuer
			const targetMembers = message.guild.voiceStates.resolve(message.author.id).channel.members;
			targetMembers.forEach(m => m.edit({channel: hiddenChannel}));

		}
	} else {
		message.author.send("Please configure a stealth channel and role.");
	}

	message.delete();
};

module.exports.config = {
	name: 'hide',
	category: 'stealth',
	categoryAliases: ['sth', 'secret'],
	commandAliases: ['hd']
};
