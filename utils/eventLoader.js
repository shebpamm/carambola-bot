const Discord = require('discord.js');
const requireAll = require('require-all');

module.exports = client => {

  //Check if there are listeners bound, and if so then remove them.
  if(client.tracked_listeners) {
    for (var listener in client.tracked_listeners) {
      console.log(...client.tracked_listeners[listener]);
      client.removeListener(...client.tracked_listeners[listener]);
    }
  }
  //Require all eventHandlers from events/
  const eventFiles = requireAll({
    dirname: `${__basedir}/events`,
    filter: /^(?!-)(.+)\.js$/
  });

  client.tracked_listeners = []

  //Iterate all event callbacks and bind them to events by filename
  for (const name in eventFiles) {
    const event = eventFiles[name];  //Get reference to method from the string
    bindedEvent = event.bind(null, client) //Create a binded function
    client.on(name, bindedEvent);
    client.tracked_listeners.push([name, bindedEvent]); //Track the listener function so we can remove it on reload

    console.log(`Loaded Event: ${name}`);
  }
}
