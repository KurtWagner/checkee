'use strict';

module.exports = function parseXML(xml) {
	const defer = require('q').defer();
	require('xml2js').parseString(xml, (err, result) => {
		if (err) {
			defer.reject(err);
		} else {
			defer.resolve(result.checkstyle);
		}
	});
	return defer.promise;
};

