'use strict';

module.exports = class ChangedChunks {
	constructor({diff}) {
		var files = require('parse-diff')(diff) || {};
		const changedChunks = files.map((file) => {
			const fileName = file.to;
			const chunks = file.chunks.map(makeAddition) || [];
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
			return false;
		}
		
		const chunk = file.chunks.find((fileChunk) => {
			return fileChunk.startLine <= line && line <= fileChunk.endLine;
		});
		if (chunk) {
			return {
				chunk,
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
	filePartsB.splice(minLength, filePartsA.length);
	
	return filePartsA.join('/') === filePartsB.join('/');
}

function makeAddition({newStart, newLines}) {
	return {
		startLine: newStart,
		endLine: newStart + newLines,
	};
}
