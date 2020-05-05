const path = require('path');
const maps = require(path.join(__basedir, 'maps.json'));

const createPugLobby = (message, guildDocument) => {
	return message.guild.channels.create('Scrim Lobby', {topic: 'Carambola', type: 'voice'});
};

const createVoiceChannel = (guild, name) => {
	return guild.channels.create(name, {topic: 'Carambola', type: 'voice'});
};

const onVoiceStateUpdate = (guild, guildDocument, oldState, newState) => {
	if (oldState.channelID !== guild.pugLobbyChannel.id && newState.channelID === guild.pugLobbyChannel.id) {
		if (guild.missingPlayers.includes(newState.member)) {
			guild.missingPlayers = guild.missingPlayers.filter(p => p !== newState.member); // QUESTION: Is using .filter() to remove an element sloppy?
		}

		if (guild.missingPlayers.length === 0) {
			guild.client.removeListener('voiceStateUpdate', guild.voiceStateListener); // Unbind the listener now that everyone is here.
			startCaptainSelect(guild, guildDocument);
		}
	}
};

const capFilter = response => {
	return response.mentions.users.size === 2 && response.author.id === response.guild.pugQueryAuthor.id;
};

const areMentionsTeamless = message => {
	return message.mentions.users.every(u => message.guild.teamlessPlayers.map(p => p.id).includes(u.id));
};

const teamFilter = response => {
	if (response.guild.teamPickStep === 0 || response.guild.teamlessPlayers.length === 1) {
		return response.mentions.users.size === 1 && response.author.id === response.guild.choosingCaptain.id && areMentionsTeamless(response);
	}

	return response.mentions.users.size === 2 && response.author.id === response.guild.choosingCaptain.id && areMentionsTeamless(response);
};

const mapPoolFilter = response => {
	return response.author.id === response.guild.pugQueryAuthor.id && Object.keys(maps).includes(response.content.trim().replace(' ', '_'));
};

const mapVetoFilter = response => {
	return response.author.id === response.guild.choosingCaptain.id && response.guild.availableMaps.includes(response.content.trim().replace(' ', '_'));
};

const startCaptainSelect = async (guild, guildDocument) => {
	guildDocument.pugs.pugStates.pugLobbyJoinActive = false;
	guildDocument.pugs.pugStates.pugCaptainPickActive = true;

	await guildDocument.clearTeams();

	guild.pugChannel.send(`${guild.pugQueryAuthor} please mention two players to select as captains.`);
	guild.pugChannel.awaitMessages(capFilter, {max: 1}).then(c => {
		// C contains all messages collected by tor,
		// we have { max: 1 } so only one message is collected
		guildDocument.setCaptain(1, c.first().mentions.users.first()).then(() => {
			guildDocument.setCaptain(2, c.first().mentions.users.last()).then(() => {
				guild.choosingCaptain = c.first().mentions.users.first();
				guild.choosingTeam = 1;
				doTeamPicks(guild, guildDocument);
			});
		});
	});
};

module.exports.startCaptainSelect = startCaptainSelect;

const movePlayersToTeams = async (guild, guildDocument) => {
	guild.teamOneVoice = await createVoiceChannel(guild, 'Team 1');
	guild.teamTwoVoice = await createVoiceChannel(guild, 'Team 2');

	// Iterate moving players one at a time as doing it async seems to mess with discord api.
	for (memberDoc of guildDocument.pugs.teams.one.players) {
		const member = await guild.members.resolve(memberDoc.id);
		if (member.user) {
			await member.edit({channel: guild.teamOneVoice}).catch(error => error);
		}
	}

	for (memberDoc of guildDocument.pugs.teams.two.players) {
		const member = await guild.members.resolve(memberDoc.id);
		if (member.user) {
			await member.edit({channel: guild.teamTwoVoice}).catch(error => error);
		}
	}
};

const getAvailableMaps = (guild, guildDocument) => {
	return maps[guild.mapPool]
		.filter(p => !guild.teamVetos.one.includes(p) && !guild.teamVetos.two.includes(p));
};

const startMapVeto = async (guild, guildDocument) => {
	guildDocument.pugs.pugStates.pugTeamPickActive = false;
	guildDocument.pugs.pugStates.pugMapSelectActive = true;

	guildDocument.save();

	guild.choosingTeam = 1;
	guild.choosingCaptain = guild.members.resolve(guildDocument.pugs.teams.one.captain.id).user;

	await guild.pugChannel.send(`${guild.pugQueryAuthor} please select map pool:\n${Object.keys(maps).join(', ')}`);
	await guild.pugChannel.awaitMessages(mapPoolFilter, {max: 1}).then(c => {
		guild.mapPool = c.first().content.trim().replace(' ', '_');
	});

	guild.teamVetos = {one: [], two: []};
	guild.availableMaps = maps[guild.mapPool];

	createMapEmbed(guild, guildDocument).then(pickEmbed => {
		guild.mapEmbed = pickEmbed;
		guild.mapCollectorListener = updateMapEmbed.bind(null, guild, guildDocument);
		guild.mapCollector = guild.pugChannel.createMessageCollector(mapVetoFilter, {max: guild.availableMaps.length});
		guild.mapCollector.on('collect', guild.mapCollectorListener);
	});
};

const createMapEmbed = (guild, guildDocument) => {
	const mapEmbedTemplate = {
		color: 0xFFCA26,
		title: `**${guild.choosingCaptain.username}** is choosing`,
		description: '',
		fields: [
			{
				name: 'Team 1',
				value: '\u200B',
				inline: true
			},
			{
				name: 'Available',
				value: '\u200B' + guild.availableMaps.join('\n'),
				inline: true
			},
			{
				name: 'Team 2',
				value: '\u200B',
				inline: true
			}
		]
	};

	return guild.pugChannel.send({embed: mapEmbedTemplate});
};

const updateMapEmbed = (guild, guildDocument, message) => {
	if (guild.choosingTeam === 1) {
		guild.teamVetos.one.push(message.content.trim().replace(' ', '_'));
		guild.choosingTeam = 2;
		guild.choosingCaptain = guild.members.resolve(guildDocument.pugs.teams.two.captain.id).user;
	} else {
		guild.teamVetos.two.push(message.content.trim().replace(' ', '_'));
		guild.choosingTeam = 1;
		guild.choosingCaptain = guild.members.resolve(guildDocument.pugs.teams.one.captain.id).user;
	}

	guild.availableMaps = getAvailableMaps(guild, guildDocument);

	const queryEmbedTemplate = {
		color: 0xFFCA26,
		title: `**${guild.choosingCaptain.username}** is choosing`,
		fields: [
			{
				name: 'Team 1',
				value: '\u200B' + guild.teamVetos.one.map(m => `~~${m}~~`).join('\n'),
				inline: true
			},
			{
				name: 'Available Maps',
				value: '\u200B' + guild.availableMaps.join('\n'),
				inline: true
			},
			{
				name: 'Team 2',
				value: '\u200B' + guild.teamVetos.two.map(m => `~~${m}~~`).join('\n'),
				inline: true
			}
		]
	};

	if (guild.availableMaps.length === 1) {
		guild.selectedMap = guild.availableMaps[0];
		guild.mapCollector.removeListener('collect', guild.mapCollectorListener);
		guild.mapCollector.stop();
		guild.pugChannel.send(`Map selected! We are playing ${guild.selectedMap}`);
	}

	return guild.mapEmbed.edit({embed: queryEmbedTemplate});
};

module.exports.startMapVeto = startMapVeto;

const updateTeamPickEmbed = (guild, guildDocument, message) => {
	guildDocument.addToTeam(guild.choosingTeam, message.mentions.users);
	guild.teamPickStep++;

	if (guild.choosingTeam === 1) {
		guild.choosingTeam = 2;
		guild.choosingCaptain = guild.members.resolve(guildDocument.pugs.teams.two.captain.id).user;
	} else {
		guild.choosingTeam = 1;
		guild.choosingCaptain = guild.members.resolve(guildDocument.pugs.teams.one.captain.id).user;
	}

	guild.teamlessPlayers = getTeamlessPlayers(guild, guildDocument);

	const queryEmbedTemplate = {
		color: 0xFFCA26,
		title: `**${guild.choosingCaptain.username}** is choosing`,
		description: `Please mention ${(guild.teamPickStep === 0 || guild.teamlessPlayers.length === 1) ? 1 : 2} in a message to choose them.`,
		fields: [
			{
				name: 'Team 1',
				value: '\u200B' + guildDocument.pugs.teams.one.players.map(p => p.username).join('\n'),
				inline: true
			},
			{
				name: 'Players',
				value: '\u200B' + guild.teamlessPlayers.map(p => p.user.username).join('\n'),
				inline: true
			},
			{
				name: 'Team 2',
				value: '\u200B' + guildDocument.pugs.teams.two.players.map(p => p.username).join('\n'),
				inline: true
			}
		]
	};

	if (guild.teamlessPlayers.length === 0) {
		guild.teamPickCollector.removeListener('collect', guild.teamPickCollectorListener);
		guild.teamPickCollector.stop();
		movePlayersToTeams(guild, guildDocument).then(() => {
			startMapVeto(guild, guildDocument);
		});
	}

	return guild.teamPickEmbed.edit({embed: queryEmbedTemplate});
};

const createTeamPickEmbed = (guild, guildDocument) => {
	const queryEmbedTemplate = {
		color: 0xFFCA26,
		title: `**${guild.choosingCaptain.username}** is choosing`,
		description: '',
		fields: [
			{
				name: 'Team 1',
				value: '\u200B' + guildDocument.pugs.teams.one.players.map(p => p.username).join('\n'),
				inline: true
			},
			{
				name: 'Players',
				value: '\u200B' + guild.teamlessPlayers.map(p => p.user.username).join('\n'),
				inline: true
			},
			{
				name: 'Team 2',
				value: '\u200B' + guildDocument.pugs.teams.two.players.map(p => p.username).join('\n'),
				inline: true
			}
		]
	};

	return guild.pugChannel.send({embed: queryEmbedTemplate});
};

const getTeamlessPlayers = (guild, guildDocument) => {
	return guild.pugPlayers
		.filter(p => !guildDocument.pugs.teams.one.players.map(c => c.id)
			.includes(p.user.id) && !guildDocument.pugs.teams.two.players.map(c => c.id).includes(p.user.id));
};

const doTeamPicks = (guild, guildDocument) => {
	guildDocument.pugs.pugStates.pugCaptainPickActive = false;
	guildDocument.pugs.pugStates.pugTeamPickActive = true;

	guildDocument.save();

	guild.teamPickStep = 0;

	guild.teamlessPlayers = getTeamlessPlayers(guild, guildDocument);

	createTeamPickEmbed(guild, guildDocument).then(pickEmbed => {
		guild.teamPickEmbed = pickEmbed;
		guild.teamPickCollectorListener = updateTeamPickEmbed.bind(null, guild, guildDocument);
		guild.teamPickCollector = guild.pugChannel.createMessageCollector(teamFilter, {max: guildDocument.pugs.pugQuery.targetPlayerCount});
		guild.teamPickCollector.on('collect', guild.teamPickCollectorListener);
	});
};

// TODO: Jesus refactor this sometime. Definitely.
module.exports.execute = async (client, message, args, guildDocument) => {
	if (guildDocument.pugs.pugStates.pugQueryActive) {
		const pugChannel = await message.guild.channels.resolve(guildDocument.config.pugs.pugChannelID);
		message.guild.pugChannel = pugChannel;
		message.guild.movedPugPlayers = [];

		if (guildDocument.pugs.pugQuery.interestedPlayersCount >= guildDocument.pugs.pugQuery.targetPlayerCount || args.includes('force')) {
			// Pug querying is now stopped as the next stage starts.
			guildDocument.pugs.pugStates.pugQueryActive = false;
			guildDocument.pugs.pugStates.pugLobbyJoinActive = true;

			guildDocument.save();

			await Promise.all([ // Await while channel has been created and players have been fetched.
				// Fetch all players that are going to be in the game and store them into the guild object.
				Promise.all(guildDocument.pugs.pugQuery.interestedPlayers.slice(0, 10).map(p => message.guild.members.fetch(p.id))).then(pugPlayers => { // Because fetch returns a promise, use Promise.all and wait for them to resolve.
					message.guild.pugPlayers = pugPlayers;
				}),
				// Create a new channel called Scrim Lobby and then store a reference into the guild object.
				createPugLobby(message, guildDocument).then(channel => {
					message.guild.pugLobbyChannel = channel;
				})
			]);
			// Iterate moving players one at a time as doing it async seems to mess with discord api.
			for (member of message.guild.pugPlayers) {
				res = await member.edit({channel: message.guild.pugLobbyChannel})
					.then(member => {
						// Add successfully moved players to an array
						message.guild.movedPugPlayers.push(member);
					})
					.catch(error => error);
			}

			// Make a list of people missing by eliminating all players that have been moved.
			message.guild.missingPlayers = message.guild.pugPlayers.filter(p => !message.guild.movedPugPlayers.map(c => c.id).includes(p.id));

			if (message.guild.missingPlayers.length === 0) {
				pugChannel.send('Created a new lobby and moved everyone.');
				startCaptainSelect(message.guild, guildDocument);
			} else {
				pugChannel.send(`Created a new lobby and moved who I could. ${message.guild.missingPlayers.join(' ')} would you please join.`);

				// Listen to voiceStateUpdates so we can track players joining the lobby.
				// Bind this specific listener to this guilds object so that each guild has their own listener.
				message.guild.voiceStateListener = onVoiceStateUpdate.bind(null, message.guild, guildDocument);
				client.on('voiceStateUpdate', message.guild.voiceStateListener);
			}
			// Command execution ends here, game flow continues after voiceState marks everyone on the lobby or a new command with force is issued.
		} else {
			message.channel.send(`Not enough participants. ${guildDocument.pugs.pugQuery.interestedPlayersCount}/${guildDocument.pugs.pugQuery.targetPlayerCount}`);
		}
	} else {
		message.channel.send('No pug active. Start a query with `pug query new`');
	}
};

module.exports.config = {
	name: 'start',
	category: 'pug',
	categoryAliases: ['scrim', 'cs', 'csgo'],
	commandAliases: ['s', 'begin']
};
