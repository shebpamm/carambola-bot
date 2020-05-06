const Discord = require('discord.js');

global.__basedir = __dirname; // Points to root directory, so that modules can load config.json from anywhere.

const eventLoader = require('./utils/eventLoader.js');
const commandLoader = require('./utils/commandLoader.js');
const mongo = require('./utils/mongo.js');

mongo.init();

const client = new Discord.Client();
const config = require('./config.json');

client.mongo = mongo;

eventLoader(client, mongo); // Fetch all eventHandlers in events/ folder.
commandLoader(client); // Fetch all commandHandlers in events/ folder.

client.setMaxListeners(5); // Get a warning if there are more than 1 listeners on events at any time.

client.login(config.botUserToken);
