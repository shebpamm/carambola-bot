const Discord = require('discord.js');
const commandHandler = require('../utils/commandHandler.js');

module.exports = async (client, mongo, interaction) => {
  if (!interaction.isCommand()) return;
  if (!interaction.guildID) return;

  let guildDocument = await mongo.Guild.findOne({guildID: interaction.guildID});
  let arguments = interaction.options.first().options || new Discord.Collection()

  console.log(arguments)

  command = client.categories[interaction.commandName].commands.get(interaction.options.first().name)

  interaction.author = interaction.user //Yeah, it's ugly.

  commandHandler.handleCommand(command, client, interaction, arguments, guildDocument)

}
