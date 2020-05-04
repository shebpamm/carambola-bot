const createPugLobby = (message, guildDocument) => {
  return message.guild.channels.create('Scrim Lobby', { topic: 'Carambola', type: 'voice'})
}

const onVoiceStateUpdate = (guild, guildDocument, oldState, newState) => {
  if(oldState.channelID !== guild.pugLobbyChannel.id && newState.channelID === guild.pugLobbyChannel.id) {
    if(guild.missingPlayers.includes(newState.member)) {
      guild.missingPlayers = guild.missingPlayers.filter(p => p !== newState.member); // QUESTION: Is using .filter() to remove an element sloppy?
    }
    if(guild.missingPlayers.length === 0) {
      guild.client.removeListener('voiceStateUpdate', guild.voiceStateListener); //Unbind the listener now that everyone is here.
      startCaptainSelect(guild, guildDocument);
    }
  }
}

const capFilter = response => {
  return response.mentions.users.size === 2 && response.author.id === response.guild.pugQueryAuthor.id;
}

const teamFilter = response => {
  if(response.guild.teamPickStep === 0) return response.mentions.users.size === 1 && response.author.id === response.guild.choosingCaptain.id
  return response.mentions.users.size === 2 && response.author.id === response.guild.choosingCaptain.id
}

const startCaptainSelect = async (guild, guildDocument) => {
  guildDocument.pugs.pugStates.pugLobbyJoinActive = false;
  guildDocument.pugs.pugStates.pugCaptainPickActive = true;

  await guildDocument.clearTeams();

  guild.pugChannel.send(`${guild.pugQueryAuthor} please mention two players to select as captains.`)
  guild.pugChannel.awaitMessages(capFilter, { max: 1 }).then(c => {

    //C contains all messages collected by MessageCollector,
    //we have { max: 1 } so only one message is collected
    guildDocument.setCaptain(1, c.first().mentions.users.first()).then(() => {
      guildDocument.setCaptain(2, c.first().mentions.users.last()).then(() => {
        guild.choosingCaptain = c.first().mentions.users.first();
        guild.choosingTeam = 1;
        doTeamPicks(guild, guildDocument);
      })
    })


  })
}

module.exports.startCaptainSelect = startCaptainSelect;

const updateTeamPickEmbed = (guild, guildDocument, message) => {
  console.log("Cap pic, ", message.author);
}

const createTeamPickEmbed = (guild, guildDocument) => {
  const queryEmbedTemplate = {
    color: 0xffca26,
    title: `**${guild.choosingCaptain.username}** is choosing`,
    description: ``,
    fields: [
      {
        name:"Team 1",
        value: '\u200b' + guildDocument.pugs.teams.one.players.map(p => p.username).join('\n'),
        inline: true
      },
      {
        name:`Players`,
        value: '\u200b' + guild.pugPlayers
        .filter(p => !guildDocument.pugs.teams.one.players.map(c => c.id).includes(p.user.id) && !guildDocument.pugs.teams.two.players.map(c => c.id).includes(p.user.id))
        .map(p => p.user.username).join('\n'),
        inline: true
      },
      {
        name:`Team 2`,
        value: '\u200b' + guildDocument.pugs.teams.two.players.map(p => p.username).join('\n'),
        inline: true
      }
    ]
  }

  return guild.pugChannel.send({embed: queryEmbedTemplate});
}

const doTeamPicks = (guild, guildDocument) => {
  guildDocument.pugs.pugStates.pugCaptainPickActive = false;
  guildDocument.pugs.pugStates.pugTeamPickActive = true;

  guildDocument.save();

  guild.teamPickStep = 0;

  createTeamPickEmbed(guild, guildDocument).then(pickEmbed => {
    guild.teamPickEmbed = pickEmbed;
    guild.teamPickCollectorListener = updateTeamPickEmbed.bind(null, guild, guildDocument);
    guild.teamPickCollector = guild.pugChannel.createMessageCollector(teamFilter, {max: guildDocument.pugs.pugQuery.targetPlayerCount});
    guild.teamPickCollector.on('collect', guild.teamPickCollectorListener);
  })
}

// TODO: Jesus refactor this sometime. Definitely.
module.exports.execute = async (client, message, args, guildDocument) => {
  if(guildDocument.pugs.pugStates.pugQueryActive) {
    let pugChannel = await message.guild.channels.resolve(guildDocument.config.pugs.pugChannelID);
    message.guild.pugChannel = pugChannel;
    message.guild.movedPugPlayers = []

    if(guildDocument.pugs.pugQuery.interestedPlayersCount >= guildDocument.pugs.pugQuery.targetPlayerCount || args.includes('force')) {

      //Pug querying is now stopped as the next stage starts.
      guildDocument.pugs.pugStates.pugQueryActive = false;
      guildDocument.pugs.pugStates.pugLobbyJoinActive = true;

      guildDocument.save()

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
      //Iterate moving players one at a time as doing it async seems to mess with discord api.
      for (member of message.guild.pugPlayers) {
        res = await member.edit({channel: message.guild.pugLobbyChannel})
        .then( member => {
          //Add successfully moved players to an array
          message.guild.movedPugPlayers.push(member);
        })
        .catch(e => e);
      }
      //make a list of people missing by eliminating all players that have been moved.
      message.guild.missingPlayers = message.guild.pugPlayers.filter(p => !message.guild.movedPugPlayers.map(c => c.id).includes(p.id));


      if(message.guild.missingPlayers.length === 0) {
        pugChannel.send('Created a new lobby and moved everyone.');
        startCaptainSelect(message.guild, guildDocument);
      } else {
        pugChannel.send(`Created a new lobby and moved who I could. ${message.guild.missingPlayers.join(' ')} would you please join.`);

        //Listen to voiceStateUpdates so we can track players joining the lobby.
        //Bind this specific listener to this guilds object so that each guild has their own listener.
        message.guild.voiceStateListener = onVoiceStateUpdate.bind(null, message.guild, guildDocument);
        client.on('voiceStateUpdate', message.guild.voiceStateListener);

      }
      //Command execution ends here, game flow continues after voiceState marks everyone on the lobby or a new command with force is issued.
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
