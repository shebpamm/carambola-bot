const path = require('path');
const cleanup = require(path.join(__basedir, 'utils/cleanup'));
const dathost = require(path.join(__basedir, 'utils/dathost'));

function isPugActive(guildDocument) {
	// Slice because the mongo object contains the property $init
	return !Object.values(guildDocument.pugs.pugStates).slice(1).every(c => !c);
}

module.exports.execute = async (client, commandContext, args, guildDocument) => {
	if (guildDocument.pugs.pugStates.pugCaptainPickActive) {
		commandContext.reply('Due to a bug, please first select two captains and then run this command again.');
		return;
	}

	if (isPugActive(guildDocument)) {
		if (!commandContext.pugQueryAuthor ||
			commandContext.author.id === commandContext.guild.pugQueryAuthor.id ||
			args.get('force')?.value) {
			if (guildDocument.pugs.pugStates.pugGameActive) {
				dathost.stopServer();
			}

			cleanup.doCleanup(commandContext.guild, guildDocument);
			commandContext.reply('Pug ended and cleaned up.');
		} else {
			commandContext.reply(`You are not the pug author. Please ask ${commandContext.guild.pugQueryAuthor} to cancel it.`);
		}
	} else {
		commandContext.reply('No game active. Nothing done.');
	}
};

module.exports.config = {
	name: 'cleanup',
	category: 'pug',
	description: 'Clears and resets any ongoing games.',
	categoryAliases: ['scrim', 'cs', 'csgo'],
	commandAliases: ['cc', 'stop', 'clean', 'cancel', 'cls'],
	slashEnabled: true,
	slashOptions: [{
		name: 'force',
		type: 'BOOLEAN',
		description: 'Force-clean',
		required: false
	}]
};
