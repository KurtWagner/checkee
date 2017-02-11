'use strict';

module.exports = {
	getCredentials,
};

function getCredentials(credentialsFilePath) {
	if (!credentialsFilePath) {
		throw new Error('Missing Credentials file');
	}

	const fs = require('fs');
	const path = require('path');
	
	const relativeCredentialsFilePath = path.join(process.cwd(), credentialsFilePath);
		
	if (!fs.existsSync(relativeCredentialsFilePath)) {
		throw new Error(`Missing ${credentialsFilePath} configuration file.`);
	}
	
	let credentials;
	const contents = fs.readFileSync(relativeCredentialsFilePath);
	try {
		credentials = JSON.parse(contents);
	} catch (e) {
		throw new Error(`${credentialsFilePath} must be valid JSON.`);
	}
	
	verifyConfiguration(credentials, credentialsFilePath);
	return credentials;
}

function verifyConfiguration(credentials, credentialsFilePath) {
	if (!credentials.bitbucket) {
		throw new Error(`Missing "bitbucket.username" and "bitbucket.password" in ${credentialsFilePath}`);
	}
	if (!credentials.bitbucket.username) {
		throw new Error(`Missing "bitbucket.username" in ${credentialsFilePath}`);
	}
	if (!credentials.bitbucket.password) {
		throw new Error(`Missing "bitbucket.password" in ${credentialsFilePath}`);
	}
}
