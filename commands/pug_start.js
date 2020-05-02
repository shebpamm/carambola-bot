const createPugLobby = (message, guildDocument) => {
  return message.guild.channels.create('Scrim Lobby', { topic: 'Carambola', type: 'voice'})
}


// TODO: Jesus refactor this sometime. Definitely.
module.exports.execute = async (client, message, args, guildDocument) => {
  if(guildDocument.pugs.pugQueryActive) {
    let pugChannel = await message.guild.channels.resolve(guildDocument.config.pugs.pugChannelID);
    message.guild.movedPugPlayers = []
    if(guildDocument.pugs.pugQuery.interestedPlayersCount >= guildDocument.pugs.pugQuery.targetPlayerCount || args.includes('force')) {
      await Promise.all([ //await while channel has been created and players have been fetched.
        //Fetch all players that are going to be in the game and store them into the guild object.
        Promise.all(guildDocument.pugs.pugQuery.interestedPlayers.slice(0, 10).map(p => message.guild.members.fetch(p.id))).then(pugPlayers => { //Because fetch returns a promise, use Promise.all and wait for them to resolve.
          message.guild.pugPlayers = pugPlayers;
        }),
        //Create a new channel called Scrim Lobby and then store a reference into the guild object.
        createPugLobby(message, guildDocument).then(channel => {
          message.guild.pugLobbyChannel = channel
        })
      ])
      for (member of message.guild.pugPlayers) {
        res = await member.edit({channel: message.guild.pugLobbyChannel})
        .then( member => {
          //Add successfully moved players to an array
          message.guild.movedPugPlayers.push(member);
        })
        .catch(e => e);
      }
      //make a list of people missing by eliminating all players that have been moved.
      message.guild.missingPlayers = message.guild.pugPlayers.filter(p => !message.guild.movedPugPlayers.map(c => c.id).includes(p.id))
      pugChannel.send(`Created a new lobby and moved who I could. ${message.guild.missingPlayers.join(' ')} would you please join.`)

    } else {
      message.channel.send(`Not enough participants. ${guildDocument.pugs.pugQuery.interestedPlayersCount}/${guildDocument.pugs.pugQuery.targetPlayerCount}`);
    }
  } else {
    message.channel.send("No pug active. Start a query with `pug query new`");
  }
}

module.exports.config = {
  name: 'start',
  category: 'pug',
  category_aliases: ['scrim', 'cs', 'csgo'],
  command_aliases: ['s', 'begin']
}
