'use strict';

const CONFIG_FILENAME = '.checkeerc.json';
const DEFAULT_CONFIG = {
	messageIdentifier: '.:.',
	bitbucket: {},
};

module.exports = {
	getConfig,
};

function getConfig() {
	const fs = require('fs');
	const path = require('path');
	
	const configFilePath = path.join(process.cwd(), CONFIG_FILENAME);
	if (!fs.existsSync(configFilePath)) {		
		return Object.assign({}, DEFAULT_CONFIG);
	}
	
	let config;
	const contents = fs.readFileSync(configFilePath);
	try {
		config = JSON.parse(contents);
	} catch (e) {
		throw new Error(`${CONFIG_FILENAME} must be valid JSON.`);
	}
	
	return Object.assign({}, DEFAULT_CONFIG, config);
}

