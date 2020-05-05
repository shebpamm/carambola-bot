const clean = text => { // Sanitize mentions
	if (typeof (text) === 'string') {
		return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203));
	}

	return text;
};

module.exports.execute = async (client, message, args, guildDocument) => {
	try {
		const code = args.join(' ');
		let evaled = eval(code);

		if (typeof evaled !== 'string') {
			evaled = require('util').inspect(evaled);
		}

		message.channel.send(clean(evaled), {code: 'xl'});
	} catch (error) {
		message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(error)}\n\`\`\``);
	}
};

module.exports.config = {
	name: 'eval',
	category: 'developer',
	category_aliases: ['dev', 'd'],
	command_aliases: ['ev']
};
