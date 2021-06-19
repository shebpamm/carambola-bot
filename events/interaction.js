const Discord = require('discord.js');
const commandHandler = require('../utils/commandHandler');

module.exports = async (client, mongo, interaction) => {
	if (!interaction.isCommand()) {
		return;
	}

	if (!interaction.guildID) {
		return;
	}

	const guildDocument = await mongo.Guild.findOne({guildID: interaction.guildID});
	const args = interaction.options.first().options || new Discord.Collection();

	const command = client.categories[interaction.commandName].commands.get(interaction.options.first().name);

	interaction.author = interaction.user; // Yeah, it's ugly.

	commandHandler.handleCommand(command, client, interaction, args, guildDocument);
};
