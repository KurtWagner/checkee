'use strict';

const chai = require('chai');
const mock = require('mock-fs');
const credentials = require('./credentials');

describe('getCredentials(credentialsFilePath)', () => {
	afterEach(mock.restore);
	
	it('throws an error if missing username', () => {
		mock({
			'credentials.json': `{
				"bitbucket": {
					"password": "<YOUR PASSWORD>"
				}
			}`
		});
		chai.expect(() => {
			credentials.getCredentials('credentials.json');
		}).to.throw('Missing "bitbucket.username" in credentials.json');
	});

	it('throws an error if missing password', () => {
		mock({
			'credentials.json': `{
				"bitbucket": {
					"username": "<YOUR USERNAME>"
				}
			}`
		});
		chai.expect(() => {
			credentials.getCredentials('credentials.json');
		}).to.throw('Missing "bitbucket.password" in credentials.json');
	});

	it('throws an error if missing username and password', () => {
		mock({
			'credentials.json': `{}`
		});
		chai.expect(() => {
			credentials.getCredentials('credentials.json');
		}).to.throw('Missing "bitbucket.username" and "bitbucket.password" in credentials.json');
	});

	it('throws an error if credentials file is missing', () => {
		chai.expect(() => {
			credentials.getCredentials('credentials.json');
		}).to.throw('Missing credentials.json configuration file.');
	});

	it('throws an error if credentials file is invalid JSON', () => {
		mock({
			'credentials.json': `{[invalid]}`
		});
		chai.expect(() => {
			credentials.getCredentials('credentials.json');
		}).to.throw('credentials.json must be valid JSON.');
	});

	it('throws an error if not given a path', () => {
		chai.expect(() => {
			credentials.getCredentials();
		}).to.throw('Missing Credentials file');
	});

	it('returns configuration if valid', () => {
		mock({
			'credentials.json': `{
				"bitbucket": {
					"username": "<YOUR USERNAME>",
					"password": "<YOUR PASSWORD>"
				}
			}`
		});
		const got = credentials.getCredentials('credentials.json');
		chai.expect(got).to.deep.equal({
			'bitbucket': {
				'username': '<YOUR USERNAME>',
				'password': '<YOUR PASSWORD>',
			}
		});
	});
});
