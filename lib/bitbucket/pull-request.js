'use strict';

const HTTP_OK = 200;
const constants = require('./constants');

module.exports = class BitbucketPullRequest {
	constructor({backend, repository, pullRequestId}) {
		this.repository = repository;
		this.pullRequestId = pullRequestId;
		this._backend = backend;
	}
	
	getChangedChunks() {
		return this._backend.request('get', `${constants.API_2_BASE}/repositories/${this.repository.repoUser}/${this.repository.repoSlug}/pullrequests/${this.pullRequestId}/diff`)
		.then(parseChangedChunksResponse);
	}
	
	deleteComments(...ids) {
		const pullRequest = this;
		
		const promises = [];
		ids.forEach((id) => {
			promises.push(deleteComment(id));
		});
		return require('q').all(promises).then((parts) => {
			const errors = [];
			parts.forEach(({ statusCode, body }) => {
				if (statusCode !== HTTP_OK) {
					errors.push(body);
				}
			});
			return {
				errors: errors,
			};
		});
		
		function deleteComment(id) {
			return pullRequest._backend.request('delete', `${constants.API_1_BASE}/repositories/${pullRequest.repository.repoUser}/${pullRequest.repository.repoSlug}/pullrequests/${pullRequest.pullRequestId}/comments/${id}`);
		}
	}
	
	getComments() {
		const pullRequest = this;
		
		// kick off the first pages request
		const allComments = [];
		const url = `${constants.API_2_BASE}/repositories/${this.repository.repoUser}/${this.repository.repoSlug}/pullrequests/${this.pullRequestId}/comments`;
		return pullRequest._backend.request('get', url)
		                           .then(gotComments);
						
		function gotComments({statusCode, body}) {
			if (statusCode !== HTTP_OK) { return null; }
			
			const bodyResponse = JSON.parse(body);
	
			// track all comment values
			if (bodyResponse.values) {
				allComments.push(...bodyResponse.values);
			}
			// if we're given a next url we will continue until that page
			// otherwise return all the comments we've collected!
			if (bodyResponse.next) {
				return pullRequest._backend.request('get', bodyResponse.next)
				                           .then(gotComments);
			} else {
				return allComments;
			}
		}
	}
	
	addComment(comment) {		
		const url = `${constants.API_1_BASE}/repositories/${this.repository.repoUser}/${this.repository.repoSlug}/pullrequests/${this.pullRequestId}/comments`;
		
		// From https://answers.atlassian.com/questions/32977327/are-you-planning-on-offering-an-update-pull-request-comment-api
		// You can create inline comments with 1.0. Use the filename and line_from / line_to elements in the JSON request body, as per 
		return this._backend.request('post', url, {
			line_to: comment.line, // or line_to
			filename: comment.fileName,
			content: comment.message,
		}).then(({statusCode, body}) => {
			if (statusCode !== HTTP_OK) { 
				console.error(body);
				return false;
			}
			return true;
		});
	}
	
};

class ChangedChunks {
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
}

function compareFileNames(fileNameA, fileNameB) {
	const filePartsA = fileNameA.split('/').reverse();
	const filePartsB = fileNameB.split('/').reverse();
	
	const minLength = Math.min(filePartsA.length, filePartsB.length);
	filePartsA.splice(minLength, filePartsA.length);
	filePartsB.splice(minLength, filePartsA.length);
	
	return filePartsA.join('/') === filePartsB.join('/');
}

function parseChangedChunksResponse({statusCode, body:diff = ''}) {

	if (statusCode != HTTP_OK) {
		return null;
	}
	return new ChangedChunks({ diff });
}

function makeAddition({newStart, newLines}) {
	return {
		startLine: newStart,
		endLine: newStart + newLines,
	};
}
