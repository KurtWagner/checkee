'use strict';

const path = require('path');

module.exports = {
	getArgs,
};

function getArgs(argv) {
	const packageDetails = require(path.join(__dirname, '..', 'package.json'));
	// we instantiate another commander to avoid leaky singleton
	var program = new (require('commander')).Command();
	program
		.version(packageDetails.version)
		.option(
			'-c, --checkstyle <file>',
			'path to checkstyle report XML file. This argument can be used multiple times',
			collectFilePaths,
			[]
		)
		.option(
			'--android-lint <file>',
			'path to android lint XML report file. This argument can be used multiple times',
			collectFilePaths,
			[]
		)
		.option('--repo-user <repo-user>', 'owner of the repository')
		.option('--repo-slug <repo-slug>', 'repository name')
		.option('--pull-request <pull-request-id>', 'pull request ID', Number)
		.option('--credentials <credentials file>', 'path to credentials file')
		.option('--message-identifier <unique id for messages>', 'unique id for messages')
		.option('--username <bitbucket username>', 'Bitbucket username. Needed if credentials path not provided.')
		.option('--password <bitbucket password>', 'Bitbucket password. Needed if credentials path not provided.')
		.parse(argv);

	return {
		checkstyleFilePaths: program.checkstyle,
		androidLintFilePaths: program.androidLint,
		repoUser: program.repoUser,
		repoSlug: program.repoSlug,
		pullRequestID: program.pullRequest,
		credentials: program.credentials,
		messageIdentifier: program.messageIdentifier,
		username: program.username,
		password: program.password,
	};

	function collectFilePaths(filePath, filePaths) {
		filePaths.push(filePath);
		return filePaths;
	}
}
