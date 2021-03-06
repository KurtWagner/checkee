#!/usr/bin/env node

'use strict';

const config = require('../lib/config').getConfig();
const args = require('../lib/args').getArgs(process.argv);

const { loadAndroidLintResults, loadCheckstyleResults } = require('../lib/loaders');

const credentials = getCredentialsFromArgs(args);

const BitbucketClient = require('../lib/bitbucket/client');

const {
	repoUser = config.bitbucket.repoUser,
	repoSlug = config.bitbucket.repoSlug,
	messageIdentifier = config.messageIdentifier,
	pullRequestID,
	checkstyleFilePaths = [],
	androidLintFilePaths = [],
} = args;

if (!repoSlug || !repoUser || !pullRequestID) {
	console.error('Required repo slug, repo user and pull request id');
	process.exit(1);
}

if (checkstyleFilePaths.length === 0 && androidLintFilePaths.length === 0) {
	console.error('Please supply --checkstyle or --android-lint result files.');
	process.exit(1);
}

if (checkstyleFilePaths.length > 0 && androidLintFilePaths.length > 0) {
	console.error('Please supply either --checkstyle or --android-lint result files not both.');
	process.exit(1);
}

if (!verifyCredentials(credentials)) {
	console.error('Missing username and password, or credentials file path.');
	process.exit(0);
}

const client = new BitbucketClient({
	username: credentials.bitbucket.username,
	password: credentials.bitbucket.password,
});
const pullRequest = client.repository(repoUser, repoSlug).pullRequest(pullRequestID);

const loader = checkstyleFilePaths.length > 0 ? loadCheckstyleResults : loadAndroidLintResults;
const loaderFilePaths = checkstyleFilePaths.length > 0 ? checkstyleFilePaths : androidLintFilePaths;

console.log('Getting comments, diff and current user');
loader(loaderFilePaths)
	.then(checkstyle => {
		const Q = require('q');
		return Q.all([
			Q(checkstyle),
			pullRequest.getChangedChunks(),
			pullRequest.getComments(),
			client.getCurrentUser(),
		]).then(startProcessing);
	})
	.catch(error => {
		console.error(error);
		process.exit();
	});

function startProcessing([checkstyle, changedChunks, existingComments, currentUser]) {
	const comments = getComments({ changedChunks, checkstyle });
	const currentUserComments = getPreviousCommentIds({ currentUser, existingComments });

	console.log(`Deleting ${currentUserComments.length} comments ${currentUserComments.join(', ')}`);
	pullRequest.deleteComments(...currentUserComments).then(({ errors }) => {
		if (errors.length > 0) {
			console.error('Failed to remove comments');
			console.error(errors);
		} else {
			console.log(`Adding ${comments.length} comments`);
			const addCommentPromises = [];
			comments.forEach(comment => {
				const addCommentPromise = pullRequest.addComment(comment);
				addCommentPromises.push(addCommentPromise);
			});
			require('q')
				.all(addCommentPromises)
				.finally(() => {
					console.log('Done.');
				});
		}
	});
}

function getComments({ checkstyle, changedChunks }) {
	const comments = [];
	checkstyle.forEach(({ fileName, errors }) => {
		errors.forEach(error => {
			const line = changedChunks.getLine(fileName, error.line);
			if (line) {
				comments.push({
					fileName: line.fileName,
					newLine: line.newLine,
					previousLine: line.previousLine,
					changed: line.changed,
					message: `${error.message} ${messageIdentifier}`,
					column: error.column,
				});
			}
		});
	});
	return comments;
}

function getPreviousCommentIds({ currentUser, existingComments }) {
	return existingComments.filter(isPreviousComment).map(comment => comment.id);

	function isPreviousComment(comment) {
		return comment.user.username === currentUser.username && comment.content.raw.endsWith(messageIdentifier);
	}
}

/**
 * Returns credentials information for the given process args. If a credentials
 * file path is not passed in, a username and password is required.
 *
 * @param {object} processArgs
 * @param {string} [processArgs.username] - Bitbucket username
 * @param {string} [processArgs.username] - Bitbucket password
 * @param {string} [processArgs.credentials] - Path to JSON credentials file
 */
function getCredentialsFromArgs(processArgs) {
	if (processArgs.credentials) {
		return require('../lib/credentials').getCredentials(processArgs.credentials);
	}
	return {
		bitbucket: {
			username: processArgs.username,
			password: processArgs.password,
		},
	};
}

function verifyCredentials({ bitbucket }) {
	return bitbucket && bitbucket.username && bitbucket.password;
}
