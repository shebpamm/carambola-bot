module.exports.execute = async (client, message, args, guildDocument) => {
	if (args.length === 0) {
		message.guild.fetchVoiceRegions().then(regions => {
			const leftRegions = regions.first(Math.ceil(regions.size / 2));
			const rightRegions = regions.last(Math.floor(regions.size / 2));

			const regionEmbed = {
				color: 0xFFCA26,
				title: `Current Region: ${message.guild.region}`,
				description: 'Available regions:',
				fields: [
					{
						name: '\u200B',
						value: '\u200B' + leftRegions.map(c => c.id).join('\n'),
						inline: true
					},
					{
						name: '\u200B',
						value: '\u200B' + rightRegions.map(c => c.id).join('\n'),
						inline: true
					}
				]
			};

			message.channel.send({embed: regionEmbed});
		});
	} else {
		message.guild.fetchVoiceRegions().then(regions => {
			if (args[0] === 'optimal') {
				const optimal = regions.find(c => c.optimal);
				message.guild.setRegion(optimal.id).then(() => {
					message.channel.send(`Region changed successfully to optimal (**${optimal.name}**).`);
				});
			} else if (regions.some(c => c.id === args.join(' '))) {
				message.guild.setRegion(args.join('-').toLowerCase()).then(() => {
					message.channel.send('Region changed successfully.');
				});
			} else {
				message.channel.send('Please input the region name.\nYou can list all the available regions by typing this command without parameters.');
			}
		});
	}
};

module.exports.config = {
	name: 'region',
	category: 'manage',
	categoryAliases: ['man'],
	commandAliases: ['reg']
};
