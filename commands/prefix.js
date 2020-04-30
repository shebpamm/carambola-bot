const path = require('path');
const config = require(path.join(__basedir, 'config.json'));

module.exports.execute = async (client, message, args, guildDocument) => {
  if(args.length == 0) {
    const currentPrefix = guildDocument.config.customPrefix || config.commandPrefix;;
    message.channel.send(`**Currently configured prefix:** ${currentPrefix}`);
  } else {
    guildDocument.config.customPrefix = args[0];
    guildDocument.save();
  }
}

module.exports.config = {
  name: 'prefix',
  category: 'config',
  category_aliases: ['cfg'],
  command_aliases: ['pfx']
}
