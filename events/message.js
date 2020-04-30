const path = require('path');
const config = require(path.join(__basedir, 'config.json'));

module.exports = async (client, mongo, msg) => {
  if(msg.author.bot) return; //If message author is a bot, ignore.

  guildDocument = await mongo.Guild.findOne({guildID: msg.guild.id}); //Find mongoose document with guild data.
  usedPrefix = guildDocument.config.customPrefix || config.commandPrefix; //Check if we have a custom prefix assigned for the server.

  //Use different methods to compare depending if config has prefixCaseSensitive set or not.
  if (config.prefixCaseSensitive || false) isPrefixed = msg.content.trim().startsWith(usedPrefix);
  else isPrefixed = msg.content.trim().toLowerCase().startsWith(usedPrefix.toLowerCase());
  //Check if message contains wanted command prefix
  if(isPrefixed) {
    const [catg, cmd, ...args] = msg.content.trim().slice(usedPrefix.length).trim().split(/\s+/g); //Split command into an array.

    //Check if category is valid:
    const resolvedCatg = client.categories[catg] || client.categories[client.category_aliases.get(catg)];

    if(resolvedCatg) {
      //Check if a key exists in commands or aliases and get the value(the method) from that.
      const resolvedCommand = resolvedCatg.commands.get(cmd.toLowerCase()) || resolvedCatg.commands.get(resolvedCatg.command_aliases.get(cmd.toLowerCase()));

      if(resolvedCommand) { //Found a command

        //Check if command is case sensitive, and if so return if it doesn't match.
        if(resolvedCommand.config.case_sensitive || false) {
          if(!(cmd in [resolvedCommand.config.name, ...resolvedCommand.config.command_aliases])) return;
        }

        //Check if command is a dev command, and deny it if the author is not a Developer.
        if(resolvedCommand.config.category === 'developer') {
          if(msg.author.id !== config.developerID) return;
        }

        resolvedCommand.execute(client, msg, args, guildDocument)
        console.log(`Executing ${resolvedCommand.config.name} command for ${msg.author.tag}.`);
      } //else console.log("Unknown command")
    } //else console.log(`Unknown category: ${resolvedCatg} from ${catg} in ${client.categories}`);
  }




}
