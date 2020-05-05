const Discord = require('discord.js');
const requireAll = require('require-all');

module.exports = client => {
	// Fetch all commandHandlers in commands/ folder.
	const commandFiles = requireAll({
		dirname: `${__basedir}/commands`,
		filter: /^(?!-)(.+)\.js$/
	});

	// Create maps to track categories and their aliases.
	client.categories = {};
	client.category_aliases = new Map();

	// Iterate all commands. Bind them and add them to a map inside the proper category.
	for (const name in commandFiles) {
		const cmd = commandFiles[name]; // Get reference to method from the string

		if (!client.categories[cmd.config.category]) { // If category has not been initialized, initialize.
			client.categories[cmd.config.category] = {
				commands: new Map(),
				command_aliases: new Map()
			};
			// Iterate all aliases and point them to the proper category
			for (const catg of cmd.config.category_aliases) {
				client.category_aliases.set(catg, cmd.config.category);
			}
		}

		// Add the command to the category's map
		client.categories[cmd.config.category].commands.set(cmd.config.name.toLowerCase(), cmd);
		// Add aliases for the command into the category's alias map.
		for (const a of cmd.config.command_aliases) {
			client.categories[cmd.config.category].command_aliases.set(a.toLowerCase(), cmd.config.name);
		}

		console.log(`Loaded Command: ${cmd.config.name}`);
	}
};
