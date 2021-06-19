const path = require('path');
const cleanup = require(path.join(__basedir, 'utils/cleanup'));
const dathost = require(path.join(__basedir, 'utils/dathost'));

function isPugActive(guildDocument) {
	return  !Object.values(guildDocument.pugs.pugStates).slice(1).every(c => !c) //Slice because the mongo object contains the property $init
}

module.exports.execute = async (client, message, args, guildDocument) => {
	if(guildDocument.pugs.pugStates.pugCaptainPickActive) {
		message.reply('Due to a bug, please first select two captains and then run this command again.');
		return
	}

	if (isPugActive(guildDocument)) {
		if (!message.pugQueryAuthor ||
			message.author.id === message.guild.pugQueryAuthor.id ||
	  	args.get('force')?.value) {

			if (guildDocument.pugs.pugStates.pugGameActive) {
				dathost.stopServer();
			}

			cleanup.doCleanup(message.guild, guildDocument);
			message.reply('Pug ended and cleaned up.');

		} else {
			message.reply(`You are not the pug author. Please ask ${message.guild.pugQueryAuthor} to cancel it.`);
		}
	} else {
		message.reply('No game active. Nothing done.');
	}
};

module.exports.config = {
	name: 'cleanup',
	category: 'pug',
	description: 'Clears and resets any ongoing games.',
	categoryAliases: ['scrim', 'cs', 'csgo'],
	commandAliases: ['cc', 'stop', 'clean', 'cancel', 'cls'],
	slashEnabled: true,
	slashOptions:[{
		name: 'force',
		type: 'BOOLEAN',
		description: 'Force-clean',
		required: false,
	}]
};
