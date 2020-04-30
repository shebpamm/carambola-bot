const isConfigured = (guildDocument, msg) => {
  return msg.guild.roles.fetch(guildDocument.config.pugs.pugUserRoleID) && msg.guild.channels.cache.some(channel => (channel.id === guildDocument.config.pugs.pugChannelID && channel.type === 'text'));
}

module.exports.execute = async (client, message, args, guildDocument) => {
  if(args.length === 0) {
    if(guildDocument.pugs.pugQueryActive) {
      message.channel.send(`There is a query running with ${guildDocument.pugs.pugQuery.interestedPlayersCount} interested players.`)
    } else {
      message.channel.send("There isn't a query running right now.\n Start one with the command: `pug query new`");
    }
  }
  if(args.length === 1) {
    if(['new', 'start', 'go'].includes(args[0])) {
      if(guildDocument.pugs.pugQueryActive) {
        message.channel.send('There is already a pug query active.\nYou can cancel it with `pug query cancel`');
      } else { // TODO: Going to be more active steps to check for.
        if(isConfigured(guildDocument, message)) { //Check if the bot has been given a proper channel to post in and a role to mention.
          message.channel.send("asd")
        } else {
          message.channel.send('Please give the bot a role to mention and a channel to post in:```pug config role @<role>\npug config channel #<channel>```')
        }
      }
    }
  }
}

module.exports.config = {
  name: 'query',
  category: 'pug',
  category_aliases: ['scrim', 'cs', 'csgo'],
  command_aliases: ['q']
}
