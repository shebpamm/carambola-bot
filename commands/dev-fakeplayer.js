module.exports.execute = async (client, commandContext, args, guildDocument) => {
	if (args[0] === 'query') {
		const players = commandContext.mentions.users.map(user => {
			return {id: user.id, username: user.username};
		});
		for (const player of players) {
			guildDocument.addInterestedPlayer(player);
		}
	}
};

module.exports.config = {
	name: 'fakeplayer',
	category: 'developer',
	categoryAliases: ['dev', 'd'],
	commandAliases: ['fp']
};
