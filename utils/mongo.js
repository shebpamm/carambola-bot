const mongoose = require('mongoose');

mongoose.set('useFindAndModify', false);

// Define a schema for the guilds.
const guildSchema = new mongoose.Schema({
	// Discord defined guild properties to store
	guildName: String,
	guildID: String,

	// Properties for organizing pugs
	pugs: {
		pugStates: {
			pugQueryActive: {type: Boolean, default: false},
			pugLobbyJoinActive: {type: Boolean, default: false},
			pugCaptainPickActive: {type: Boolean, default: false},
			pugTeamPickActive: {type: Boolean, default: false},
			pugMapSelectActive: {type: Boolean, default: false},
			pugGameActive: {type: Boolean, default: false},
		},
		teams: {
			one: {
				captain: {id: String, username: String},
				players: [{id: String, username: String}]
			},
			two: {
				captain: {id: String, username: String},
				players: [{id: String, username: String}]
			}
		},
		pugQuery: {
			lastCreatedAt: {type: Date, defualt: Date.now},
			interestedPlayersCount: {type: Number, default: 0},
			interestedPlayers: [{id: String, username: String}],
			targetPlayerCount: {type: Number, default: 10}
		}
	},

	// Per-server defined configuration settings.
	config: {
		customPrefix: String,
		pugs: {
			pugChannelID: String,
			pugUserRoleID: String,
			pugActiveRoleID: String,
			pugPingOnQuery: {type: Boolean, default: false},
			useActiveRole: {type: Boolean, default: false}
		},
		stealth: {
			hiddenVoiceID: String,
			hiddenVoiceRoleID: String
		},
		admin: {
			adminRoleID: String
		}
	}
}, {minimize: true});

// Adds players to the array and keeps track of the count.
guildSchema.methods.addInterestedPlayer = function (user) {
	return Promise.all([
		this.updateOne({$inc:{'pugs.pugQuery.interestedPlayersCount':1}}).exec(),
		this.updateOne({$push:{'pugs.pugQuery.interestedPlayers': {id: user.id, username: user.username} }}).exec(),
	])
};

// Removes players from the array and keeps track of the count.
guildSchema.methods.removeInterestedPlayer = function (user) {
	return Promise.all([
		this.updateOne({$inc:{'pugs.pugQuery.interestedPlayersCount':-1}}).exec(),
		this.updateOne({$pull:{'pugs.pugQuery.interestedPlayers': {id: user.id, username: user.username} }}).exec()
	])
};

guildSchema.methods.clearInterestedPlayers = function () {
	this.pugs.pugQuery.interestedPlayersCount = 0;
	this.pugs.pugQuery.interestedPlayers = [];
	return this.save();
};

guildSchema.methods.setCaptain = function (team, user) {
	if (team === 1) {
		this.pugs.teams.one.captain = {id: user.id, username: user.username};
		return this.addToTeam(team, [user]);
	}

	if (team === 2) {
		this.pugs.teams.two.captain = {id: user.id, username: user.username};
		return this.addToTeam(team, [user]);
	}
};

guildSchema.methods.addToTeam = function (team, users) {
	if (team === 1) {
		this.pugs.teams.one.players.push(...users.map(user => {
			return {id: user.id, username: user.username};
		}));
	}

	if (team === 2) {
		this.pugs.teams.two.players.push(...users.map(user => {
			return {id: user.id, username: user.username};
		}));
	}

	return this.save();
};

guildSchema.methods.clearTeams = function () {
	this.pugs.teams.one.players = [];
	this.pugs.teams.two.players = [];
};

module.exports.Guild = mongoose.model('Guild', guildSchema);

const userInfoSchema = new mongoose.Schema({
	shortenedID: String,
	discordID: String,
	discordTag: String,
	steam:
	{
		type:
		{
			steamID: String,
			steamName: String,
			profileurl: String
		},
		set: setSteamInfo
	}
});

function setSteamInfo(user) {
	return {
		steamID: user.id,
		steamName: user.displayName,
		profileurl: user.photos[2].value
	};
}

module.exports.userInfo = mongoose.model('userInfo', userInfoSchema);

// Initialize a connection to the Mongo database and return a promise that resolves after the connection opens.
module.exports.init = async () => {
	mongoose.connect('mongodb://localhost/carambola', {useNewUrlParser: true, useUnifiedTopology: true});
	const db = mongoose.connection;
	module.exports.db = db;
	db.on('error', error => console.error(error));

	return new Promise(resolve => {
		db.once('open', () => {
			console.log('Connected to MongoDB.');
			resolve();
		});
	});
};
