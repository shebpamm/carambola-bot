const pugStart = require('./pug-start');

module.exports.execute = async (client, commandContext, args, guildDocument) => {
	client.removeListener('voiceStateUpdate', commandContext.guild.voiceStateListener);
	pugStart.startCaptainSelect(commandContext.guild, guildDocument);
};

// Even though name is pug_allPresent, command is a dev command.
module.exports.config = {
	name: 'allPresent',
	category: 'developer',
	categoryAliases: ['dev', 'd'],
	commandAliases: ['ap']
};
