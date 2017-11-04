'use strict';

const HTTP_TOO_MANY_REQUESTS = 429;
const HTTP_FORBIDDEN = 403;
const HTTP_UNAUTHORIZED = 401;

module.exports = class BitbucketBackend {
	constructor({ username, password }) {
		this._username = username;
		this._password = password;

		// due to rate limits we're going to queue requests and control
		// how they're fired out. This is slower but reduces our chances
		// of hitting pesky limits.
		this._requestQueue = [];
		this._queueRunning = false;
		this._tryAgainInMilliseconds = 2000;
	}

	request(method, url, formData) {
		const Q = require('q');
		const deferred = Q.defer();
		const backend = this;

		backend._requestQueue.push(executeRequest);

		function executeRequest() {
			const request = require('request');
			request[method](backend._requestConfig({ url, formData }), (error, response, body) => {
				if (response.statusCode === HTTP_TOO_MANY_REQUESTS) {
					// we will try again
					setTimeout(() => {
						backend._requestQueue.unshift(executeRequest);
						backend._tryAgainInMilliseconds *= 2;
						backend._nextIntQueue();
					}, backend._tryAgainInMilliseconds);
				} else if (response.statusCode === HTTP_FORBIDDEN) {
					console.error(body);
					process.exit(1); // TODO: use a better exit code
				} else if (response.statusCode === HTTP_UNAUTHORIZED) {
					const message = [
						'1. You have configured your username and password',
						'2. Your username is in fact your username and not email',
						'3. Your username and password are correct',
					];
					console.error(`We could not authorize you. Please ensure:\n\n${message.join('\n')}`);
					process.exit(1); // TODO: use a better exit code
				} else {
					if (error) {
						deferred.reject(error);
					} else {
						deferred.resolve({ statusCode: response.statusCode, body });
					}
					backend._nextIntQueue();
				}
			});
		}

		// if the queue isn't running, kick it off
		if (!backend._queueRunning) {
			backend._nextIntQueue();
		}
		return deferred.promise;
	}

	_nextIntQueue() {
		if (this._requestQueue.length > 0) {
			this._queueRunning = true;
			const queueMethod = this._requestQueue.shift();
			queueMethod();
		} else {
			this._queueRunning = false;
		}
	}

	_requestConfig({ url, formData = {} }) {
		return {
			formData,
			url,
			auth: {
				user: this._username,
				pass: this._password,
				sendImmediately: true,
			},
		};
	}
};
