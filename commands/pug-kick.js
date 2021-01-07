module.exports.execute = async (client, message, args, guildDocument) => {

	if(!guildDocument.pugs.pugStates.pugQueryActive) {
		message.channel.send("No query active.");
		return;
	}

	if(message.mentions.users.size === 0) {
		message.channel.send("Please mention user(s) to kick.");
		return;
	}


	await Promise.all(message.mentions.users.map( user => {
		if(user.id === message.guild.pugQueryAuthor.id) {
			message.channel.send("Can't remove query author.")
			return;
		}

		//Check that some dumbass doesn't try to remove the bot itself.
		if(user.id === message.client.user.id) {
			message.channel.send("_bruh_")
			return;
		}

		message.guild.pugQueryMessage.reactions.cache.get("👍").users.remove(user.id);
	}));
};



module.exports.config = {
	name: 'kick',
	category: 'pug',
	categoryAliases: ['scrim', 'cs', 'csgo'],
	commandAliases: ['👢', 'boot', 'begone', 'kk']
};
