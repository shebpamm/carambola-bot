const path = require('path');
const config = require(path.join(__basedir, 'config.json'));

module.exports.handleCommand = (resolvedCommand, client, commandContext, args, guildDocument) => {
  //Check that the user has sufficient permissions for the command
  if(resolvedCommand.config.permissions) {
    if (!commandContext.member.hasPermission('ADMINISTRATOR')) { //If user has the ADMINISTRATOR permission, skip permission checks.
      if (resolvedCommand.config.permissions.includes('admin')) {
        if (!commandContext.member.roles.cache.has(guildDocument.config.admin.adminRoleID)) {
          commandContext.channel.send("You don't have permissions to run this command.");
          return;
        }
      }
    }
  }

  // Check if command is a dev command, and deny it if the author is not a Developer.
  if (resolvedCommand.config.category === 'developer') {
    if (commandContext.author.id !== config.developerID) {
      return;
    }
  }

  resolvedCommand.execute(client, commandContext, args, guildDocument);
  console.log(`Executing ${resolvedCommand.config.name} command for ${commandContext.author.tag}.`);
}
