const mongoose = require('mongoose');

mongoose.set('useFindAndModify', false);

//Define a schema for the guilds.
const guildSchema = new mongoose.Schema({
  //Discord defined guild properties to store
  guildName : String,
  guildID : String,

  //Properties for organizing pugs
  pugs: {
    pugQueryActive: {type: Boolean, default: false},
    pugQuery: {
      lastCreatedAt: {type: Date, defualt: Date.now },
      interestedPlayersCount: {type: Number, default: 0},
      interestedPlayers: [{type: String}],
      targetPlayerCount: {type: Number, default: 10}
    }
  },

  //Per-server defined configuration settings.
  config: {
    customPrefix: String,
    pugs: {
      pugChannelID: String,
      pugUserRoleID: String
    }
  }

  // TODO: Permissions?
}, {minimize: true})

module.exports.Guild = mongoose.model('Guild', guildSchema);

//Initialize a connection to the Mongo database and return a promise that resolves after the connection opens.
module.exports.init = async () => {
  mongoose.connect('mongodb://localhost/carambola', {useNewUrlParser: true, useUnifiedTopology: true});
  const db = mongoose.connection;
  module.exports.db = db;
  db.on('error', error => console.error(error))

  return new Promise(resolve => {
    db.once('open', () => {
      console.log("Connected to MongoDB.");
      resolve();
    })
  })
}
