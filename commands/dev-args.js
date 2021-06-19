module.exports.execute = async (client, commandContext, args, guildDocument) => {
	commandContext.reply(args.array().map(x => x.value).join(', ') + '​');
};

module.exports.config = {
	name: 'args',
	category: 'developer',
	description: 'Messages all supplied arguments.',
	categoryAliases: ['dev', 'd'],
	commandAliases: ['arg'],
	slashEnabled: true,
	slashOptions: [{
		name: 'arg1',
		type: 'STRING',
		description: 'First arg',
		required: true
	},
	{
		name: 'arg2',
		type: 'STRING',
		description: 'Second arg',
		required: false
	}]
};
