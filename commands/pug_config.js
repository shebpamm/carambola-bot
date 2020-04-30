module.exports.execute = async (client, message, args, guildDocument) => {
  if(args.length === 0) {
    message.channel.send("//TODO"); // TODO: Add a help print after you have implemented the help printing lol
  } else {
    if(args.length === 1) {
      if(["role", "mention"].includes(args[0])) {
        let currentRole = await message.guild.roles.fetch(guildDocument.config.pugs.pugUserRoleID || "");
        if(currentRole.id) message.channel.send(`Currently assigned pug role: **${currentRole.name}**`, {allowedMentions: {'parse' : [] }})
        else message.channel.send('No pug role assigned.\nAssign one with:\n`pug config role @<role>`')
      }
      if(["channel", "feed"].includes(args[0])) {
        let currentChannel = await message.guild.channels.cache.find(channel => (channel.id === guildDocument.config.pugs.pugChannelID && channel.type === 'text'));
        if(currentChannel.id) message.channel.send(`Currently assigned pug channel: **${currentChannel.name}**`, {allowedMentions: {'parse' : [] }})
        else message.channel.send('No pug channel assigned.\nAssign one with:\n`pug config channel #<channel>`')
      }

    } else {
      if(args.length === 2) {
        if(["role", "mention"].includes(args[0])) {
          if(message.mentions.roles.size === 1) {
            guildDocument.config.pugs.pugUserRoleID = message.mentions.roles.first().id;
            guildDocument.save()
            message.channel.send('New role assigned successfully.')
          }
        }
        if(["channel", "feed"].includes(args[0])) {
          if(message.mentions.channels.size === 1) {
            if(message.mentions.channels.first().type === 'text') {
              guildDocument.config.pugs.pugChannelID = message.mentions.channels.first().id;
              guildDocument.save()
              message.channel.send('New channel assigned successfully.')
            } else message.channel.send('Invalid Channel. Please use a text channel.');
          }
        }
      }
    }
  }
}

module.exports.config = {
  name: 'config',
  category: 'pug',
  category_aliases: ['scrim', 'cs', 'csgo'],
  command_aliases: ['cfg']
}
