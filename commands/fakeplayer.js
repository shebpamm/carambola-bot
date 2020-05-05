module.exports.execute = async (client, message, args, guildDocument) => {
	if (args[0] == 'query') {
		players = message.mentions.users.map(user => {
			return {id: user.id, username: user.username};
		});
		for (player of players) {
			await guildDocument.addInterestedPlayer(player);
		}
	}
};

module.exports.config = {
	name: 'fakeplayer',
	category: 'developer',
	categoryAliases: ['dev', 'd'],
	commandAliases: ['fp']
};
