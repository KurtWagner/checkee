#!/usr/bin/env node

'use strict';

const config = require('../lib/config').getConfig();
const args = require('../lib/args').getArgs();

const credentials = require('../lib/credentials').getCredentials(args.credentials);

const BitbucketClient = require('../lib/bitbucket/client');

const {
	repoUser = config.bitbucket.repoUser,
	repoSlug = config.bitbucket.repoSlug,
	pullRequestID,
	checkstyleFilePaths,
} = args;



if (!repoSlug || !repoUser || !pullRequestID) {
	console.error('Required repo slug, repo user and pull request id');
	process.exit(1);
}

if (!checkstyleFilePaths || checkstyleFilePaths.length === 0) {
	console.log('No check file paths. Nothing to do.');
	process.exit(0);
}

const client = new BitbucketClient({
	username: credentials.bitbucket.username,
	password: credentials.bitbucket.password,
});
const pullRequest = client.repository(repoUser, repoSlug)
                          .pullRequest(pullRequestID);

console.log('Getting comments, diff and current user');
getCheckStyle().then((checkstyle) => {
	const Q = require('q');
	return Q.all([
		Q(checkstyle),
		pullRequest.getChangedChunks(),
		pullRequest.getComments(),
		client.getCurrentUser(),
	])
	 .then(startProcessing);
}).catch((error) => {
	console.error(error);
	process.exit();
});

function startProcessing([checkstyle, changedChunks, existingComments, currentUser]) {
	
	const comments = getComments({changedChunks, checkstyle});
	const currentUserComments = getPreviousCommentIds({ currentUser, existingComments });
	
	console.log(`Deleting ${currentUserComments.length} comments ${currentUserComments.join(', ')}`);
	pullRequest.deleteComments(...currentUserComments).then(({errors}) => {
		if (errors.length > 0) {
			console.error('Failed to remove comments');
			console.error(errors);
		} else {
			console.log(`Adding ${comments.length} comments`);
			const addCommentPromises = [];
			comments.forEach((comment) => {
				const addCommentPromise = pullRequest.addComment(comment);
				addCommentPromises.push(addCommentPromise);
			});
			require('q').all(addCommentPromises).finally(() => {
				console.log('Done.');
			});
		}
	});
}

function getCheckStyle() {
	const checkstyles     = require('../lib/checkstyles');
	const parseCheckstyle = require('../lib/parser/checkstyle');
	
	return checkstyles.getCheckstyles(...checkstyleFilePaths)
	                  .then(filePaths => parseCheckstyle(...filePaths));
}

function getComments({checkstyle, changedChunks}) {
	const comments = [];
	checkstyle.forEach(({fileName, errors}) => {
		errors.forEach((error) => {
			const line = changedChunks.getLine(fileName, error.line);
			if (line) {
				comments.push({
					fileName: line.fileName, 
					line: error.line,
					message: `${error.message} ${config.messageIdentifier}`,
					column: error.column,
				});
			}
		});
	});
	return comments;
}

function getPreviousCommentIds({currentUser, existingComments}) {
	return existingComments.filter(isPreviousComment)
	                       .map(comment => comment.id);
	
	function isPreviousComment(comment) {
		return comment.user.username === currentUser.username &&
		       comment.content.raw.endsWith(config.messageIdentifier);
	}
}