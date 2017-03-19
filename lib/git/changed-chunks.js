'use strict';

module.exports = class ChangedChunks {
	constructor({diff}) {
		var files = require('parse-diff')(diff) || {};
		const changedChunks = files.map((file) => {
			const fileName = file.to;
			const chunks = file.chunks.map(makeLineChangedMap) || [];
			return {
				fileName,
				chunks,
			};
		});
		
		this.changedChunks = changedChunks;
	}
	
	getLine(fileName, line) {
		const file = this._getFile(fileName);
		if (!file) {
			return null;
		}
		
		const chunk = file.chunks.find((fileChunk) => {
			return fileChunk[line] !== undefined;
		});
		if (chunk !== undefined) {
			return {
				changed: chunk[line],
				fileName: file.fileName,
			};
		}
		return null;
	}
	
	_getFile(fileName) {
		return this.changedChunks.find((file) => {
			return compareFileNames(file.fileName, fileName);
		});
	}
};

function compareFileNames(fileNameA, fileNameB) {
	const filePartsA = fileNameA.split('/').reverse();
	const filePartsB = fileNameB.split('/').reverse();
	
	const minLength = Math.min(filePartsA.length, filePartsB.length);
	filePartsA.splice(minLength, filePartsA.length);
	filePartsB.splice(minLength, filePartsB.length);
	
	return filePartsA.join('/') === filePartsB.join('/');
}

function makeLineChangedMap({changes}) {
	return changes.reduce(function (accumulator, change) {
		/**
		 * We don't care for deleted lines as our changed chunk is purely
		 * from the perception of the latest set, not what was there
		 */
		if (change.del) { return accumulator; }
		accumulator[change.ln2 || change.ln] = !!change.add;
		return accumulator;
	}, {});
}
