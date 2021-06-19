const path = require('path');
const matchBase = require(path.join(__basedir, 'matchBase.json'));
const botConfig = require(path.join(__basedir, 'config.json'));
const axios = require('axios');
const FormData = require('form-data');

async function uploadConfig(matchConfig) {
	const data = new FormData();

	const configBuffer = Buffer.from(JSON.stringify(matchConfig));

	data.append('file', configBuffer, {
		knownLength: configBuffer.byteLength,
		filename: 'match.json',
		contentType: 'application/json'
	});

	return axios.post(
		`https://dathost.net/api/0.1/game-servers/${botConfig.dathost.serverID}/files/match.json`,
		data,
		{
			headers: {
				...data.getHeaders(),
				'Content-Length': data.getLengthSync()
			},
			auth: {
				username: botConfig.dathost.email,
				password: botConfig.dathost.password
			}
		});
}

function sleep(ms) {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	});
}

async function waitForServerToStart() {
	let isBooting = true;
	while (isBooting) {
		const response = await axios.get(
			`https://dathost.net/api/0.1/game-servers/${botConfig.dathost.serverID}`,
			{
				headers: {'X-Fields': 'on,booting'},
				auth: {
					username: botConfig.dathost.email,
					password: botConfig.dathost.password
				}
			}
		);

		// Console.log(response, response.data.on, response.data.booting, !(response.data.on && !response.data.booting) )

		isBooting = !(response.data.on && !response.data.booting);
		await sleep(1000);
	}

	return true;
}

async function getServerIP() {
	return axios.get(
		`https://dathost.net/api/0.1/game-servers/${botConfig.dathost.serverID}`,
		{
			headers: {'X-Fields': 'ip,ports'},
			auth: {
				username: botConfig.dathost.email,
				password: botConfig.dathost.password
			}
		}
	).then(response => `${response.data.ip}:${response.data.ports.game}`);
}

async function startServer() {
	axios.post(
		`https://dathost.net/api/0.1/game-servers/${botConfig.dathost.serverID}/start`,
		null,
		{
			auth: {
				username: botConfig.dathost.email,
				password: botConfig.dathost.password
			}
		}
	);
	const serverIP = getServerIP();
	await waitForServerToStart();
	// Console.log(serverIP)
	return serverIP;
}

module.exports.stopServer = stopServer;
async function stopServer() {
	axios.post(
		`https://dathost.net/api/0.1/game-servers/${botConfig.dathost.serverID}/stop`,
		null,
		{
			auth: {
				username: botConfig.dathost.email,
				password: botConfig.dathost.password
			}
		}
	);
}

module.exports.loadGet5Config = loadGet5Config;
async function loadGet5Config() {
	const command = 'line=get5_loadmatch%20match.json';

	return axios.post(
		`https://dathost.net/api/0.1/game-servers/${botConfig.dathost.serverID}/console`,
		command,
		{
			headers: {
				'content-type': 'application/x-www-form-urlencoded'
			},
			auth: {
				username: botConfig.dathost.email,
				password: botConfig.dathost.password
			}
		});
}

async function getTeamSteamIDs(mongo, guildDocument) {
	const teamOnePromises = guildDocument.pugs.teams.one.players.map(p => {
		return mongo.UserInfo.findOne({discordID: p.id})
			.select('steam.steamID').then(usr => usr.steam.steamID);
	});

	const teamTwoPromises = guildDocument.pugs.teams.two.players.map(p => {
		return mongo.UserInfo.findOne({discordID: p.id})
			.select('steam.steamID').then(usr => usr.steam.steamID);
	});

	const steamIDs = Promise.all([
		Promise.all(teamOnePromises),
		Promise.all(teamTwoPromises)
	]);
	return steamIDs;
}

async function constructMatchConfig(guild, guildDocument) {
	const matchJson = matchBase;

	return getTeamSteamIDs(guild.client.mongo, guildDocument).then(teamSteamIDs => {
		matchJson.maplist = [guild.selectedMap];
		matchJson.team1.players = teamSteamIDs[0];
		matchJson.team2.players = teamSteamIDs[1];

		return matchJson;
	});
}

module.exports.newMatch = (guild, guildDocument) => {
	return constructMatchConfig(guild, guildDocument).then(matchConfig => {
		return startServer().then(serverIP => {
			return uploadConfig(matchConfig).then(response => loadGet5Config().then(() => {
				return serverIP;
			}));
		});
	});
};
