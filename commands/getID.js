module.exports.execute = async (client, message, args) => {
  message.reply(`Your ID is \`${message.author.id}\``);
}

module.exports.config = {
  name: 'getID',
  category: 'developer',
  category_aliases: ['dev', 'd'],
  command_aliases: ['userID'],
  case_sensitive: false
}
