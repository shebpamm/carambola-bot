const Discord = require('discord.js');

const requireAll = require('require-all');
const eventLoader = require('./utils/eventLoader.js');
const commandLoader = require('./utils/commandLoader.js');

const client = new Discord.Client();
const config = require('./config.json')

global.__basedir = __dirname; //Points to root directory, so that modules can load config.json from anywhere.


eventLoader(client); //Fetch all eventHandlers in events/ folder.
commandLoader(client); //Fetch all commandHandlers in events/ folder.

client.setMaxListeners(1); //Get a warning if there are more than 1 listeners on events at any time.

client.login(config.botUserToken)
