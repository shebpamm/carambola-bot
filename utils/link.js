const path = require('path');
const config = require(path.join(__basedir, 'config.json'));
const radix = require(path.join(__basedir, 'utils/radix64.js'))('a0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ+bcdefghijklmnopqrstuvwxyz=');

module.exports.getUserInfoDocument = getUserInfoDocument;
async function getUserInfoDocument(mongo, user) {
	return mongo.userInfo.findOne({discordID: user.id})
}

module.exports.isUserLinked = isUserLinked;
function isUserLinked(userInfoDocument) {
	return (userInfoDocument && userInfoDocument.steam && userInfoDocument.steam.steamID)
}

module.exports.getUserLinkingUrl = getUserLinkingUrl;
function getUserLinkingUrl(userInfoDocument) {
	return `http://${config.authUrl}/${userInfoDocument.shortenedID}`
}

module.exports.createUserInfoDocument = createUserInfoDocument;
function createUserInfoDocument(mongo, user) {
	const shortenedID = radix.encodeInt(user.id);

	const newUserDoc = new mongo.userInfo({
		shortenedID,
		discordID: user.id,
		discordTag: user.tag
	});
	return newUserDoc.save();
}

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
