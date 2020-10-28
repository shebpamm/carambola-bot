const Discord = require('discord.js');

const createQueryMessageEmbed = async (message, description, maxSigns = 99) => {
	const queryEmbed = {
		color: 0xFFCA26,
		title: `${description}`,
		description: `If you're interested, react with :thumbsup: below!`,
		fields: [
			{
				name: 'Player count:', value: `0/${maxSigns}`
			}
		]
	};
	return message.channel.send({embed: queryEmbed});
};

const updateQueryMessageEmbed = async (embedMessage, queryObject) => {
	const queryEmbedTemplate = {
		color: 0xFFCA26,
		title: `${queryObject.title}`,
		description: `If you're interested, react with :thumbsup: below!`,
		fields: [
			{
				name: 'Player count:', value: `${queryObject.queryData.interestedPlayersCount}/${queryObject.queryData.targetPlayerCount}`
			},
			{
				name: `Players (${Math.min(queryObject.queryData.interestedPlayersCount, queryObject.queryData.targetPlayerCount)}/${queryObject.queryData.targetPlayerCount}):`,
				value: '\u200B' + queryObject.queryData.interestedPlayers.slice(0, queryObject.queryData.targetPlayerCount).map(p => p.username).join('\n'),
				inline: true
			},
			{
				name: 'Reserve players:',
				value: '\u200B' + queryObject.queryData.interestedPlayers.slice(queryObject.queryData.targetPlayerCount).map(p => p.username).join('\n'),
				inline: true
			}
		]
	};

	const queryEmbed = new Discord.MessageEmbed(queryEmbedTemplate);
	// QueryEmbed.addFields(...guildDocument.pugs.pugQuery.interestedPlayers.map(p => {return { name : p.username, value : '\u200b', inline : true }}))

	return embedMessage.edit(queryEmbed);
};

const endQueryMessageEmbed = (embed) => {
	const finalEmbed = new Discord.MessageEmbed(embed.embeds[0]).setTitle('This query has ended.');
	return embed.edit(finalEmbed);
}

const reactionCollectorFilter = (reaction, user) => {
	return reaction.emoji.name === '👍' && !user.bot; // Is a thumbsup, cant see it on my os lol.
};

const onQueryReactionCollect = (queryMessage, queryObject, reaction, user) => {
	//console.log(`${user.tag} reacted! ${reaction.message}`);
	addInterestedPlayer(queryObject, user);
	updateQueryMessageEmbed(reaction.message, queryObject);
};

const onQueryReactionRemove = (queryMessage, queryObject, reaction, user) => {
	//console.log(`${user.tag} un-reacted!`);
	removeInterestedPlayer(queryObject, user);
	updateQueryMessageEmbed(reaction.message, queryObject);
};

const createQueryReactionCollector = (queryMessage, queryObject) => {
	const collector = queryMessage.createReactionCollector(reactionCollectorFilter, {dispose: true, time: 24*60*60*1000});
	collector.on('collect', onQueryReactionCollect.bind(null, queryMessage, queryObject));
	collector.on('remove', onQueryReactionRemove.bind(null, queryMessage, queryObject));
	collector.on('end', endQueryMessageEmbed.bind(null, queryMessage));
};

const addInterestedPlayer = (queryObject, user) => {
	queryObject.queryData.interestedPlayersCount++;
	queryObject.queryData.interestedPlayers.push({id: user.id, username: user.username});
};

// Removes players from the array and keeps track of the count.
const removeInterestedPlayer = (queryObject, user) => {
	queryObject.queryData.interestedPlayersCount--;
	queryObject.queryData.interestedPlayers = queryObject.queryData.interestedPlayers.filter(u => u.id !== user.id); // A bit ugly but the array is never going to be big :shrug:
};

module.exports.execute = async (client, message, args, guildDocument) => {
	if (args.length === 0) {
		if(message.author.queries && Object.keys(message.author.queries).length > 0) {
			message.channel.send(`You have ${Object.keys(message.author.queries).length} queries active. They cancel after a day.`);
		} else {
			message.channel.send("You have no queries active. Queries last for a day.");
		}
		return
	}

	if (args[0].length > 256) {
		message.channel.send("Too long title. Max length by discord is 256 characters.");
		return;
	}

	if (args.length === 1) {
		maxSigns = 99;
	}
	if (args.length === 2) {
		parsedMax = Number.parseInt(args[1]);
		if (Number.isNaN(parsedMax) || parsedMax > 100 || parsedMax < 1) maxSigns = 99
		else maxSigns =  parsedMax
	}



	createQueryMessageEmbed(message, args[0], maxSigns).then( queryMessage => {
		queryMessage.react('👍').then(queryMessageReaction => {
			// Create a reaction collector after the message has been sent.
			const queryObject = {
				'message' : queryMessage,
				'title' : args[0],
				'queryData' : {
					'targetPlayerCount' : maxSigns,
					'interestedPlayersCount' : 0,
					'interestedPlayers' : []
				}
			};
			message.author.queries = message.author.queries || {};
			message.author.queries[queryMessage.id] = queryObject

			queryObject.reactionCollector = createQueryReactionCollector(queryMessage, queryObject);
		});
	})
};

module.exports.config = {
	name: 'query',
	category: 'utility',
	categoryAliases: ['util', 'misc'],
	commandAliases: ['q']
};
