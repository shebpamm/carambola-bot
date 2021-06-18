module.exports = async (client, mongo, interaction) => {
  if (!interaction.isCommand()) return;
  if (!interaction.guildID) return;

  let guildDocument = await mongo.Guild.findOne({guildID: interaction.guildID});
  let arguments = interaction.options.first().options

  console.log(arguments)

  command = client.categories[interaction.commandName].commands.get(interaction.options.first().name)

  command.execute(client, interaction, arguments, guildDocument)

}
