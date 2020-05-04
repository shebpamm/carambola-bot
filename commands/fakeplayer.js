module.exports.execute = async (client, message, args, guildDocument) => {
  if(args[0] == 'query') {
    guildDocument.addInterestedPlayer(message.mentions.users.first());
  }
}

module.exports.config = {
  name: 'fakeplayer',
  category: 'developer',
  category_aliases: ['dev', 'd'],
  command_aliases: ['fp']
}
