'use strict';

module.exports = {
	getCheckstyles,
};

function getCheckstyles(...checkstyleFilePaths) {
	const fs = require('fs');
	const Q = require('q');
	
	const xmlPromises = [];
	checkstyleFilePaths.forEach((checkstyleFilePath) => {
		if (!fs.existsSync(checkstyleFilePath)) {
			throw new Error(`Couldn't find ${checkstyleFilePath}.`);
		}
		const contents = fs.readFileSync(checkstyleFilePath);
		const parseXML = require('./parser/xml');
		xmlPromises.push(parseXML(contents));
	});
	return Q.all(xmlPromises);
}

