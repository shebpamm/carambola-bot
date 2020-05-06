const path = require('path');
const config = require(path.join(__basedir, 'config.json'));
const radix = require(path.join(__basedir, 'utils/radix64.js'))('a0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ+bcdefghijklmnopqrstuvwxyz=');

module.exports.execute = async (client, message, args, guildDocument) => {
	const shortenedID = radix.encodeInt(message.author.id);

	client.mongo.userInfo.findOne({discordID: message.author.id}).then(userInfoDocument => {
		if (userInfoDocument) {
			if (userInfoDocument.steam && userInfoDocument.steam.steamID) {
				message.channel.send('Your account is already linked.');
				return;
			}

			message.author.send(`Please log into steam here: <http://${config.authUrl}/${shortenedID}>`);
			return;
		}

		const newUserDoc = new client.mongo.userInfo({
			shortenedID,
			discordID: message.author.id,
			discordTag: message.author.tag
		});
		newUserDoc.save().then(() => {
			message.author.send(`Please log into steam here: <http://${config.authUrl}/${shortenedID}>`);
		});
	}).catch(error => {
		console.log(error);
	});
};

module.exports.config = {
	name: 'link',
	category: 'pug',
	categoryAliases: ['scrim', 'cs', 'csgo'],
	commandAliases: ['li', 'connect']
};
