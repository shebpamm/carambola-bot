const path = require('path');
const config = require(path.join(__basedir, 'config.json'));

module.exports.execute = async (client, message, args, guildDocument) => {
  if(args.length == 0) { //If no args are given, print current prefix.
    const currentPrefix = guildDocument.config.customPrefix || config.commandPrefix; //Get custom prefix from db with a fallback to config's commandPrefix.
    message.channel.send(`**Currently configured prefix:** ${currentPrefix}`);
  } else { //If there are arguments, use the first one as a new prefix.
    guildDocument.config.customPrefix = args[0];
    guildDocument.save(); //Flush to db
  }
}

module.exports.config = {
  name: 'prefix',
  category: 'config',
  category_aliases: ['cfg'],
  command_aliases: ['pfx']
}
