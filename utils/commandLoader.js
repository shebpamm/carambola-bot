const requireAll = require('require-all');

module.exports = client => {
	// Fetch all commandHandlers in commands/ folder.
	const commandFiles = requireAll({
		dirname: `${__basedir}/commands`,
		filter: /^(?!-)(.+)\.js$/
	});

	// Create maps to track categories and their aliases.
	client.categories = {};
	client.categoryAliases = new Map();

	// Iterate all commands. Bind them and add them to a map inside the proper category.
	for (const fileName in commandFiles) {
		const cmd = commandFiles[fileName]; // Get reference to method from the string

		if (!client.categories[cmd.config.category]) { // If category has not been initialized, initialize.
			client.categories[cmd.config.category] = {
				commands: new Map(),
				commandAliases: new Map()
			};
			// Iterate all aliases and point them to the proper category
			for (const catg of cmd.config.categoryAliases) {
				client.categoryAliases.set(catg, cmd.config.category);
			}
		}

		// Add the command to the category's map
		client.categories[cmd.config.category].commands.set(cmd.config.name.toLowerCase(), cmd);
		// Add aliases for the command into the category's alias map.
		for (const a of cmd.config.commandAliases) {
			client.categories[cmd.config.category].commandAliases.set(a.toLowerCase(), cmd.config.name);
		}

		console.log(`Loaded Command: ${cmd.config.name}`);
	}

		setSlashCommands(client)
};

//Interate categories and commands to create a object to send to api for slash commands
const setSlashCommands =  async (client) => {
	client.slashCommands = {}
	let slashData = []

	slashData = Object.entries(client.categories)
	.filter(([key, val ]) => Array.from(val.commands) //Filter the list to iterate by checking if at least one command contains slashEnabled
	.some(([key, val]) => val.config.slashEnabled))
	.map(([catKey, category]) => { //Iterate Category
		return {
			'name': catKey,
			'description': 'category-test',
			'options': Array.from(category.commands, ([cmdKey, command]) => { //Iterate Command, functions same as map()
				if(!command.config.slashEnabled) return

				return {
					'name': command.config.name,
					'description': command.config.description,
					'type': 'SUB_COMMAND',
					'options': command.config.slashOptions
				}
			}).filter(x => x)
		}
	})
	const commands = await client.application.commands.set(slashData);
	client.slashData = slashData
}
