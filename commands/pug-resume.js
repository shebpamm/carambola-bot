const path = require('path');
const dathost = require(path.join(__basedir, '/utils/dathost.js'));
const linking = require(path.join(__basedir, '/utils/link.js'));

module.exports.execute = async (client, message, args, guildDocument) => {
	let guild = message.guild;

	guild.notLinkedPlayers = [];
	for (player of guild.pugPlayers) {
		await linking.getUserInfoDocument(guild.client.mongo, player).then(async userInfoDocument => {
			if ( !linking.isUserLinked(userInfoDocument) ) {
				guild.notLinkedPlayers.push(player);
			}
		})
	}
	if(guild.notLinkedPlayers.length !== 0) {
		guild.pugChannel.send(`Players ${guild.notLinkedPlayers.join(' ')} still haven't linked.`);
	} else {
		const matchIP = await dathost.newMatch(guild, guildDocument);
		guild.pugChannel.send(`Server started.\n**Type into console:** \`connect ${matchIP};\``)
	}
};

module.exports.config = {
	name: 'resume',
	category: 'pug',
	categoryAliases: ['scrim', 'cs', 'csgo'],
	commandAliases: ['res', 'continue']
};
