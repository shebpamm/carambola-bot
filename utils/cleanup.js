const Discord = require('discord.js');

const cleanableProperties = [
	'pugQueryAuthor',
	'pugQueryMessage',
	'pugQueryReactionCollector',
	'pugChannel',
	'movedPugPlayers',
	'pugPlayers',
	'pugLobbyChannel',
	'missingPlayers',
	'voiceStateListener',
	'choosingCaptain',
	'choosingTeam',
	'teamPickStep',
	'teamlessPlayers',
	'teamPickEmbed',
	'teamPickCollectorListener',
	'teamPickCollector',
	'teamOneVoice',
	'teamTwoVoice',
	'mapPool',
	'teamVetos',
	'availableMaps',
	'mapEmbed',
	'mapCollectorListener',
	'mapCollector',
	'selectedMap'
]

const clearActiveRoles = async (guild, players, activeRoleID) => {
	players.map(usr => {
		guild.members.resolve(usr.id).roles.remove(activeRoleID)
	})
}

const endEmbeds = (guild) => {
	if(guild.pugQueryMessage) endEmbed(guild.pugQueryMessage);
	if(guild.teamPickEmbed) endEmbed(guild.teamPickEmbed);
	if(guild.mapEmbed) endEmbed(guild.mapEmbed);
}

const endEmbed = (embed) => {
	const finalEmbed = new Discord.MessageEmbed(embed.embeds[0]).setTitle('This query has ended.');
	return embed.edit(finalEmbed);
}

const stopCollectors = (guild) => {
	if(guild.pugQueryReactionCollector) guild.pugQueryReactionCollector.stop();
	if(guild.teamPickCollector) guild.teamPickCollector.stop();
	if(guild.mapCollector) guild.mapCollector.stop();
}

const deleteVoiceChannels = (guild) => {
	if(guild.pugLobbyChannel) guild.pugLobbyChannel.delete();
	if(guild.teamOneVoice) guild.teamOneVoice.delete();
	if(guild.teamTwoVoice) guild.teamTwoVoice.delete();
}



const deleteProperties = (guild) => {
	for (var prop of cleanableProperties) {
		delete guild[prop];
	}
}

const doCleanup = (guild, guildDocument) => {
	clearActiveRoles(guild, guildDocument.pugs.pugQuery.interestedPlayers, guildDocument.config.pugs.pugActiveRoleID);
	guildDocument.pugs.pugQuery.interestedPlayersCount = 0;
	guildDocument.pugs.pugQuery.interestedPlayers = [];
	Object.keys(guildDocument.pugs.pugStates).forEach(v => guildDocument.pugs.pugStates[v] = false); //Sets all pugStates to false
	guildDocument.pugs.teams.one.players = [];
	guildDocument.pugs.teams.two.players = [];

	guildDocument.save();

	stopCollectors(guild);
	endEmbeds(guild);

	deleteVoiceChannels(guild);
	deleteProperties(guild);
}

module.exports.doCleanup = doCleanup;
