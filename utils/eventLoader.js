const requireAll = require('require-all');

module.exports = (client, mongo) => {
	// Check if there are listeners bound, and if so then remove them.
	if (client.trackedListeners) {
		for (const listener in client.trackedListeners) {
			console.log(...client.trackedListeners[listener]);
			client.removeListener(...client.trackedListeners[listener]);
		}
	}

	// Require all eventHandlers from events/
	const eventFiles = requireAll({
		dirname: `${__basedir}/events`,
		filter: /^(?!-)(.+)\.js$/
	});

	client.trackedListeners = [];

	// Iterate all event callbacks and bind them to events by filename
	for (const name in eventFiles) {
		const event = eventFiles[name]; // Get reference to method from the string
		const bindedEvent = event.bind(null, client, mongo); // Create a binded function
		client.on(name, bindedEvent);
		client.trackedListeners.push([name, bindedEvent]); // Track the listener function so we can remove it on reload

		console.log(`Loaded Event: ${name}`);
	}
};
