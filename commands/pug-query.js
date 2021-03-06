const Discord = require('discord.js');

const isConfigured = (guildDocument, message) => { // Check if proper roles and channel have been assigned.
	return message.guild.roles.fetch(guildDocument.config.pugs.pugUserRoleID || '')
	&& message.guild.channels.resolve(guildDocument.config.pugs.pugChannelID)
	&& (!guildDocument.config.pugs.useActiveRole || message.guild.roles.fetch(guildDocument.config.pugs.pugActiveRoleID || ''));
};

const createPugQueryMessageEmbed = async (message, guildDocument) => {
	const pugRole = await message.guild.roles.fetch(guildDocument.config.pugs.pugUserRoleID || '');
	const pugChannel = await message.guild.channels.resolve(guildDocument.config.pugs.pugChannelID);
	const queryEmbed = {
		color: 0xFFCA26,
		title: `${message.guild.pugQueryAuthor.username} is interested in doing a 5v5!`,
		description: `If you're interested, react with :thumbsup: below!`,
		fields: [
			{
				name: 'Player count:', value: '0/10'
			}
		]
	};
	return pugChannel.send((guildDocument.config.pugs.pugPingOnQuery ? pugRole : ""), {embed: queryEmbed});
};

const updatePugQueryMessageEmbed = async (embedMessage, guildDocument) => {
	const pugRole = await embedMessage.guild.roles.fetch(guildDocument.config.pugs.pugUserRoleID || '');
	const queryEmbedTemplate = {
		color: 0xFFCA26,
		title: `${embedMessage.guild.pugQueryAuthor.username} is interested in doing a 5v5!`,
		description: `If you're interested, react with :thumbsup: below!`,
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
				value: '\u200B' + guildDocument.pugs.pugQuery.interestedPlayers.slice(10).map(p => p.username).join('\n'),
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

const onQueryReactionCollect = async (guildDocument, reaction, user) => {
	//console.log(`${user.tag} reacted! ${reaction.message}`);
	if(guildDocument.config.pugs.useActiveRole) {
		reaction.message.guild.member(user).roles.add(guildDocument.config.pugs.pugActiveRoleID);
	}
	await guildDocument.addInterestedPlayer(user);
	refreshedDocument = await guildDocument.model(guildDocument.constructor.modelName).findOne({_id: guildDocument.id}); //Fetch the document again from mongo so that updates show.
	return updatePugQueryMessageEmbed(reaction.message, refreshedDocument);
};

const onQueryReactionRemove = async (guildDocument, reaction, user) => {
	//console.log(`${user.tag} un-reacted!`);
	if(guildDocument.config.pugs.useActiveRole) {
		reaction.message.guild.member(user).roles.remove(guildDocument.config.pugs.pugActiveRoleID);
	}

	await guildDocument.removeInterestedPlayer(user);
	refreshedDocument = await guildDocument.model(guildDocument.constructor.modelName).findOne({_id: guildDocument.id}); //Fetch the document again from mongo so that updates show.
	return updatePugQueryMessageEmbed(reaction.message, refreshedDocument);
};

const createPugQueryReactionCollector = (queryMessage, guildDocument) => {
	const collector = queryMessage.createReactionCollector(reactionCollectorFilter, {dispose: true});
	collector.on('collect', onQueryReactionCollect.bind(null, guildDocument));
	collector.on('remove', onQueryReactionRemove.bind(null, guildDocument));
	return collector;
};

module.exports.execute = async (client, message, args, guildDocument) => {
	if (args.length === 0) {
		if (guildDocument.pugs.pugStates.pugQueryActive) {
			message.channel.send(`There is a query running with ${guildDocument.pugs.pugQuery.interestedPlayersCount} interested players.`);
		} else {
			message.channel.send(`There isn't a query running right now.\n Start one with the command: \`${guildDocument.config.usedPrefix} pug query new\``);
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
				message.channel.send(`Please give the bot all the roles required and a channel to post in:\`\`\`${guildDocument.config.usedPrefix} pug config role @<role>\n${guildDocument.config.usedPrefix} pug config channel #<channel>\`\`\``);
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
