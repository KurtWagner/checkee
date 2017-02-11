'use strict';

module.exports = class BitbucketClient {
	constructor({backend, username, password}) {
		const BitbucketBackend = require('./backend');
		this._backend = backend || new BitbucketBackend({username, password});
	}
	
	repository(repoUser, repoSlug) {
		const BitbucketRepository = require('./repository');
		
		return new BitbucketRepository({
			backend: this._backend,
			repoUser,
			repoSlug,
		});
	}
	
	getCurrentUser() {
		const constants = require('./constants');
		return this._backend.request('get', `${constants.API_2_BASE}/user`).then(({statusCode, body}) => {
			if (statusCode !== 200) { return null; }
			return JSON.parse(body);
		});
	}
};
