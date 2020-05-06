const Discord = require('discord.js');

const isConfigured = (guildDocument, message) => { // Check if proper roles and channel have been assigned.
	return message.guild.roles.fetch(guildDocument.config.pugs.pugUserRoleID || '') && message.guild.channels.resolve(guildDocument.config.pugs.pugChannelID);
};

const createPugQueryMessageEmbed = async (message, guildDocument) => {
	const pugRole = await message.guild.roles.fetch(guildDocument.config.pugs.pugUserRoleID || '');
	const pugChannel = await message.guild.channels.resolve(guildDocument.config.pugs.pugChannelID);
	const queryEmbed = {
		color: 0xFFCA26,
		title: `${message.guild.pugQueryAuthor.username} is interested in doing a 5v5!`,
		description: `If you're interested, react with :thumbsup: below! ${pugRole}`,
		fields: [
			{
				name: 'Player count:', value: '0/10'
			}
		]
	};
	return pugChannel.send({embed: queryEmbed});
};

const updatePugQueryMessageEmbed = async (embedMessage, guildDocument) => {
	const pugRole = await embedMessage.guild.roles.fetch(guildDocument.config.pugs.pugUserRoleID || '');
	const queryEmbedTemplate = {
		color: 0xFFCA26,
		title: `${embedMessage.guild.pugQueryAuthor.username} is interested in doing a 5v5!`,
		description: `If you're interested, react with :thumbsup: below! ${pugRole}`,
		fields: [
			{
				name: 'Player count:', value: `${guildDocument.pugs.pugQuery.interestedPlayersCount}/10`
			},
			{
				name: `Players (${Math.min(guildDocument.pugs.pugQuery.interestedPlayersCount, 10)}/10):`,
				value: '\u200B' + guildDocument.pugs.pugQuery.interestedPlayers.slice(0, 10).map(p => p.username).join('\n'),
				inline: true
			},
			{
				name: 'Reserve players:',
				value: '\u200B' + guildDocument.pugs.pugQuery.interestedPlayers.slice(11).map(p => p.username).join('\n'),
				inline: true
			}
		]
	};

	const queryEmbed = new Discord.MessageEmbed(queryEmbedTemplate);
	// QueryEmbed.addFields(...guildDocument.pugs.pugQuery.interestedPlayers.map(p => {return { name : p.username, value : '\u200b', inline : true }}))

	return embedMessage.edit(queryEmbed);
};

const reactionCollectorFilter = (reaction, user) => {
	return reaction.emoji.name === '👍' && !user.bot; // Is a thumbsup, cant see it on my os lol.
};

const onQueryReactionCollect = (guildDocument, reaction, user) => {
	console.log(`${user.tag} reacted! ${reaction.message}`);
	guildDocument.addInterestedPlayer(user).then(() => {
		updatePugQueryMessageEmbed(reaction.message, guildDocument);
	});
};

const onQueryReactionRemove = (guildDocument, reaction, user) => {
	console.log(`${user.tag} un-reacted!`);
	guildDocument.removeInterestedPlayer(user).then(() => {
		updatePugQueryMessageEmbed(reaction.message, guildDocument);
	});
};

const createPugQueryReactionCollector = (queryMessage, guildDocument) => {
	const collector = queryMessage.createReactionCollector(reactionCollectorFilter, {dispose: true});
	collector.on('collect', onQueryReactionCollect.bind(null, guildDocument));
	collector.on('remove', onQueryReactionRemove.bind(null, guildDocument));
};

module.exports.execute = async (client, message, args, guildDocument) => {
	if (args.length === 0) {
		if (guildDocument.pugs.pugStates.pugQueryActive) {
			message.channel.send(`There is a query running with ${guildDocument.pugs.pugQuery.interestedPlayersCount} interested players.`);
		} else {
			message.channel.send('There isn\'t a query running right now.\n Start one with the command: `pug query new`');
		}
	}

	if (args.length === 1) {
		if (['new', 'start', 'go'].includes(args[0])) {
			if (guildDocument.pugs.pugStates.pugQueryActive) {
				message.channel.send('There is already a pug query active.\nYou can cancel it with `pug query cancel`');
			} else if (isConfigured(guildDocument, message)) { // Check if the bot has been given a proper channel to post in and a role to mention.
				guildDocument.pugs.lastCreatedAt = undefined;
				await guildDocument.clearInterestedPlayers();

				message.guild.pugQueryAuthor = message.author;

				createPugQueryMessageEmbed(message, guildDocument).then(queryMessage => { // Create a new embed and send it.
					message.guild.pugQueryMessage = queryMessage;
					queryMessage.react('👍').then(queryMessageReaction => {
						// Create a reaction collector after the message has been sent.
						message.guild.pugQueryReactionCollector = createPugQueryReactionCollector(queryMessage, guildDocument);
					});
				});
				guildDocument.pugs.pugStates.pugQueryActive = true;
				guildDocument.save();
			} else {
				message.channel.send('Please give the bot a role to mention and a channel to post in:```pug config role @<role>\npug config channel #<channel>```');
			}
		}

		if (['cancel', 'cc'].includes(args[0])) {
			if (guildDocument.pugs.pugStates.pugQueryActive) {
				guildDocument.pugs.pugQuery.interestedPlayersCount = 0;
				guildDocument.pugs.pugQuery.interestedPlayers = [];
				guildDocument.pugs.pugStates.pugQueryActive = false;
				guildDocument.save();
				message.channel.send('Query cancelled.');
			} else {
				message.channel.send('No query active. Nothing done.');
			}
		}
	}
};

module.exports.config = {
	name: 'query',
	category: 'pug',
	categoryAliases: ['scrim', 'cs', 'csgo'],
	commandAliases: ['q']
};
