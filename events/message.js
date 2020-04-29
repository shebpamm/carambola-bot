const path = require('path');
const config = require(path.join(__basedir, 'config.json'));

module.exports = (client, msg) => {
  if(msg.author.bot) return; //If message author is a bot, ignore.

  //Use different methods to compare depending if config has prefixCaseSensitive set or not.
  if (config.prefixCaseSensitive || false) isPrefixed = msg.content.trim().startsWith(config.commandPrefix);
  else isPrefixed = msg.content.trim().toLowerCase().startsWith(config.commandPrefix.toLowerCase());
  //Check if message contains wanted command prefix
  if(isPrefixed) {
    const [catg, cmd, ...args] = msg.content.trim().slice(config.commandPrefix.length).trim().split(/\s+/g); //Split command into an array.

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
        resolvedCommand.execute(client, msg, args)
        console.log(`Executing ${resolvedCommand.config.name} command for ${msg.author.tag}.`);
      } //else console.log("Unknown command")
    } //else console.log(`Unknown category: ${resolvedCatg} from ${catg} in ${client.categories}`);
  }




}
