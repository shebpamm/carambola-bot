module.exports.execute = async (client, message, args, guildDocument) => {

	if(!guildDocument.pugs.pugStates.pugQueryActive) {
		message.reply("No query active.");
		return;
	}

	if(!args.get('user').value) {
		message.reply("Please mention user to kick.");
		return;
	}

	if(args.get('user').value === message.guild.pugQueryAuthor?.id) {
		message.reply("Can't remove query author.")
		return;
	}

	//Check that some dumbass doesn't try to remove the bot itself.
	if(args.get('user').value === message.client.user.id) {
		message.reply("_bruh_")
		return;
	}

	message.guild.pugQueryMessage.reactions.cache.get("👍").users.remove(args.get('user').value);
	message.reply('Player kicked.')
};



module.exports.config = {
	name: 'kick',
	category: 'pug',
	description: 'Kick a player from a query',
	categoryAliases: ['scrim', 'cs', 'csgo'],
	commandAliases: ['👢', 'boot', 'begone', 'kk'],
	slashEnabled: true,
	slashOptions:[{
		name: 'user',
		type: 'USER',
		description: 'User to kick',
		required: true,
	}]
};
