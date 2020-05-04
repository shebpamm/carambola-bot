pugStart = require('./pug_start.js');

module.exports.execute = async (client, message, args, guildDocument) => {
  pugStart.startCaptainSelect(message.guild, guildDocument);
}

//Even though name is pug_allPresent, command is a dev command.
module.exports.config = {
  name: 'allPresent',
  category: 'developer',
  category_aliases: ['dev', 'd'],
  command_aliases: ['p']
}
