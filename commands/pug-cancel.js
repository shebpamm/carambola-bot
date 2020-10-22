const path = require('path');
const cleanup = require(path.join(__basedir, 'utils/cleanup'));
const dathost = require(path.join(__basedir, 'utils/dathost'));

function isPugActive(guildDocument) {
	return  !Object.values(guildDocument.pugs.pugStates).slice(1).every(c => !c) //Slice because the mongo object contains the property $init
}

module.exports.execute = async (client, message, args, guildDocument) => {
	if(guildDocument.pugs.pugStates.pugCaptainPickActive) {
		message.channel.send('Due to a bug, please first select two captains and then run this command again.');
		return
	}

	if (isPugActive(guildDocument)) {
		if (!message.pugQueryAuthor || message.author.id === message.guild.pugQueryAuthor.id ||
			 (args.length === 1 && args[0] === 'force')) {

			if (guildDocument.pugs.pugStates.pugGameActive) {
				dathost.stopServer();
			}

			cleanup.doCleanup(message.guild, guildDocument);
			message.channel.send('Pug ended and cleaned up.');

		} else {
			message.channel.send(`You are not the pug author. Please ask ${message.guild.pugQueryAuthor} to cancel it.`);
		}
	} else {
		message.channel.send('No game active. Nothing done.');
	}
};

module.exports.config = {
	name: 'cancel',
	category: 'pug',
	categoryAliases: ['scrim', 'cs', 'csgo'],
	commandAliases: ['cc', 'stop', 'clean', 'cleanup', 'cls']
};
