'use strict';

const BASE = 64;
const BASE_BITS = 6;

// Use URL safe characters in lexicographically sorted order
const LEXICOGRAPHICAL_BASE64_URL = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz'
	.split('').sort().join('');

module.exports = function (alphabet) {
	alphabet = alphabet || LEXICOGRAPHICAL_BASE64_URL;
	if (alphabet.length !== BASE) {
		throw new Error('alphabet must be ' + BASE + ' characters long!');
	}

	const charToDec = {};
	for (let i = 0; i < alphabet.length; i++) {
		const char = alphabet[i];
		if (char in charToDec) {
			throw new Error('alphabet has duplicate characters!');
		}

		charToDec[char] = i;
	}

	function encodeInt(number, length) {
		if (length) {
			const bounds = 2 ** (6 * length);
			if (number >= bounds) {
				throw new Error('Int (' + number + ') is greater than or equal to max bound (' + bounds + ') for encoded string length (' + length + ')');
			}
		} else {
			let log = Math.log2(number);
			if (2 ** Math.round(log) === number) {
				log++;
			}

			length = Math.max(1, Math.ceil(log / BASE_BITS));
		}

		const chars = new Array(length);
		let i = chars.length - 1;
		while (number > 0) {
			chars[i--] = alphabet[number % BASE];
			number = Math.floor(number / BASE);
		}

		while (i >= 0) {
			chars[i--] = alphabet[0];
		}

		return chars.join('');
	}

	function decodeToInt(string) {
		let i = 0;
		let number = 0;
		do {
			number = (number * BASE) + charToDec[string[i]];
			i++;
		} while (i < string.length);

		return number;
	}

	return {
		encodeInt,
		decodeToInt
	};
};
