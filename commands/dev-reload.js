const path = require('path');
const eventLoader = require(path.join(__basedir, 'utils/eventLoader.js'));
const commandLoader = require(path.join(__basedir, 'utils/commandLoader.js'));

module.exports.execute = async (client, commandContext, args, guildDocument) => {
	for (const path in require.cache) {
		if (path.endsWith('.js') && path.includes('events')) { // Only clear *.js, not *.node
			delete require.cache[path];
		}
	}

	if (args.length === 0) { // If no argument is given, reload both events and commands.
		eventLoader(client);
		commandLoader(client);
		commandContext.reply('Reloaded successfully.');
		return;
	}

	if (args[0] === 'commands') {
		commandLoader(client);
		commandContext.reply('Reloaded commands successfully.');
		return;
	}

	if (args[0] === 'events') {
		eventLoader(client);
		commandContext.reply('Reloaded events successfully.');
		return;
	}

	commandContext.reply('Improper arguments. Use either `commands` or `events`');
};

module.exports.config = {
	category: 'developer',
	categoryAliases: ['dev', 'd'],
	name: 'reload',
	commandAliases: ['r', 'restart']
};
