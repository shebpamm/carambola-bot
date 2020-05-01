const isConfigured = (guildDocument, msg) => { //Check if proper roles and channel have been assigned.
  return msg.guild.roles.fetch(guildDocument.config.pugs.pugUserRoleID || "") && msg.guild.channels.resolve(guildDocument.config.pugs.pugChannelID);
}

const createPugQueryMessageEmbed = async (message, guildDocument) => {
  pugRole = await message.guild.roles.fetch(guildDocument.config.pugs.pugUserRoleID || "");
  pugChannel = await message.guild.channels.resolve(guildDocument.config.pugs.pugChannelID);
  const queryEmbed = {
    color: 0x00ffff,
    title: `${message.author.name} is interested in playing a 5v5!`,
    description: `If you're interested, react with :thumbsup: below! ${pugRole}`
  }

  return pugChannel.send({embed: queryEmbed, })
}

const reactionCollectorFilter = (reaction, user) => {
  return reaction.emoji.name === '👍'; //Is a thumbsup, cant see it on my os lol.
}

const createPugQueryReactionCollector = queryMessage => {
  const collector = queryMessage.createReactionCollector(reactionCollectorFilter);
  collector.on('collect',(reaction, user) => { //Whenever someone reacts.
    console.log(`${user.tag} reacted!`)
  });

  collector.on('dispose',(reaction, user) => { //Whenever someone candels their reaction.
    console.log(`${user.tag} un-reacted!`)
  });
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
          createPugQueryMessageEmbed(message, guildDocument).then(queryMessage => { //Create a new embed and send it.
            message.guild.pugQueryMessage = queryMessage;
            queryMessage.react('👍').then(queryMessageReaction => {
              message.guild.pugQueryReactionCollector = createPugQueryReactionCollector(queryMessage); //Create a reaction collector after the message has been sent.
            })
          })
          guildDocument.pugs.pugQueryActive = true;
          guildDocument.save()
        } else {
          message.channel.send('Please give the bot a role to mention and a channel to post in:```pug config role @<role>\npug config channel #<channel>```')
        }
      }
    }
    if(['cancel', 'cc'].includes(args[0])) {
      if(guildDocument.pugs.pugQueryActive) {
        guildDocument.pugs.pugQueryActive = false
        guildDocument.save()
        message.channel.send("Query cancelled.")
      } else {
        message.channel.send("No query active. Nothing done.")
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
