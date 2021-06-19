const path = require('path');
const config = require(path.join(__basedir, 'config.json'));
const radix = require(path.join(__basedir, 'utils/radix64.js'))('a0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ+bcdefghijklmnopqrstuvwxyz=');

module.exports.execute = async (client, commandContext, args, guildDocument) => {
	const shortenedID = radix.encodeInt(commandContext.author.id);

	client.mongo.UserInfo.findOne({discordID: commandContext.author.id}).then(userInfoDocument => {
		if (userInfoDocument) {
			if (userInfoDocument.steam && userInfoDocument.steam.steamID) {
				commandContext.reply('Your account is already linked.');
				return;
			}

			commandContext.reply({content: `Please log into steam here: <http://${config.authUrl}/${shortenedID}>`, ephemeral: true});
			return;
		}

		const newUserDoc = new client.mongo.UserInfo({
			shortenedID,
			discordID: commandContext.author.id,
			discordTag: commandContext.author.tag
		});
		newUserDoc.save().then(() => {
			commandContext.reply({content: `Please log into steam here: <http://${config.authUrl}/${shortenedID}>`, ephemeral: true});
		});
	}).catch(error => {
		console.log(error);
	});
};

module.exports.config = {
	name: 'link',
	category: 'pug',
	description: 'Link your steam with Carambola',
	categoryAliases: ['scrim', 'cs', 'csgo'],
	commandAliases: ['li', 'connect'],
	slashEnabled: true
};
