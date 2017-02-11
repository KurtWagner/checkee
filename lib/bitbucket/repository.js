'use strict';

module.exports = class BitbucketRepository {
	constructor({backend, repoUser, repoSlug}) {
		this.repoUser = repoUser;
		this.repoSlug = repoSlug;
		this._backend = backend;
	}
	
	pullRequest(id) {
		const BitbucketPullRequest = require('./pull-request');
		
		return new BitbucketPullRequest({
			backend       : this._backend,
			repository    : this,
			pullRequestId : id,
		});
	}
};
