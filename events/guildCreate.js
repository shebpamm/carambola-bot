module.exports = async (client, mongo, guild) => {
  console.log(`Added to guild: ${guild.name}`);

  //Create a new document for the guild, if it doesn't exist.
  let document = await mongo.Guild.findOneAndUpdate(
    {guildID: guild.id}, {guildName: guild.name},
    {upsert: true, new: true, setDefaultsOnInsert: true})

  document.save()
}
