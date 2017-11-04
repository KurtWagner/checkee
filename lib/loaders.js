'use strict';

module.exports = {
	loadCheckstyleResults,
	loadAndroidLintResults
};

function loadCheckstyleResults(resultFilePaths) {
	const parseCheckstyle = require('../lib/parser/checkstyle');
	return getLinterResults(resultFilePaths)
		.then(linterResults => parseCheckstyle(...linterResults));
}

function loadAndroidLintResults(resultFilePaths) {
	const parseAndroidLint = require('../lib/parser/android-lint');
	return getLinterResults(resultFilePaths)
		.then(linterResults => parseAndroidLint(...linterResults));
}

function getLinterResults(filePaths) {
	const fs = require('fs');
	const Q = require('q');

	const xmlPromises = [];
	filePaths.forEach((filePath) => {
		if (!fs.existsSync(filePath)) {
			throw new Error(`Couldn't find file ${filePath}.`);
		}
		const contents = fs.readFileSync(filePath);
		const parseXML = require('./parser/xml');
		xmlPromises.push(parseXML(contents));
	});
	return Q.all(xmlPromises);
}
