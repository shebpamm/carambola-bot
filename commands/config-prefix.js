const path = require('path');
const config = require(path.join(__basedir, 'config.json'));

module.exports.execute = async (client, commandContext, args, guildDocument) => {
	if (args.size === 0) { // If no args are given, print current prefix.
		const currentPrefix = guildDocument.config.usedPrefix || config.commandPrefix; // Get custom prefix from db with a fallback to config's commandPrefix.
		commandContext.reply(`**Currently configured prefix:** ${currentPrefix}`);
	} else { // If there are arguments, use the first one as a new prefix.
		guildDocument.config.usedPrefix = args.get('prefix').value;
		guildDocument.save(); // Flush to db
		commandContext.reply('**Prefix changed successfully.**');
	}
};

module.exports.config = {
	name: 'prefix',
	category: 'config',
	description: 'Change/view the prefix Carambola uses',
	categoryAliases: ['cfg'],
	commandAliases: ['pfx'],
	slashEnabled: true,
	slashOptions: [{
		name: 'prefix',
		type: 'STRING',
		description: 'The prefix to use',
		required: false
	}]

};
