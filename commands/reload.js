const path = require('path');
const eventLoader = require(path.join(__basedir, 'utils/eventLoader.js'));
const commandLoader = require(path.join(__basedir, 'utils/commandLoader.js'));

module.exports.execute = async (client, message, args) => {
  if(args.length == 0) { //If no argument is given, reload both events and commands.
    eventLoader(client);
    commandLoader(client);
    message.reply('Reloaded successfully.');
    return;
  }

  if (args[0] == 'commands') {
    commandLoader(client);
    message.reply('Reloaded commands successfully.');
    return;
  }

  if (args[0] == 'events') {
    eventLoader(client);
    message.reply('Reloaded events successfully.');
    return;
  }

  message.reply("Improper arguments. Use either `commands` or `events`");

}

module.exports.config = {
  category: 'developer',
  category_aliases: ['dev', 'd'],
  name: 'reload',
  command_aliases: ['r', 'restart']
}
