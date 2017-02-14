'use strict';

const chai = require('chai');
const args = require('./args');

describe('messageIdentifier argument', () => {
	it('is optional', () => {
		const argv = [
			'node',
			'checkee',
		];
		const got = args.getArgs(argv).messageIdentifier;
		let expected;
		chai.expect(got).to.equal(expected);
	});
	it('is retrieved from --message-identifier', () => {
		const argv = [
			'node',
			'checkee',
			'--message-identifier',
			'abc',
		];
		const got = args.getArgs(argv).messageIdentifier;
		const expected = 'abc';
		chai.expect(got).to.equal(expected);
	});
});

describe('username and password arguments', () => {
	it('are optional', () => {
		const argv = [
			'node',
			'checkee',
		];
		chai.expect(args.getArgs(argv).username).to.equal(undefined);
		chai.expect(args.getArgs(argv).password).to.equal(undefined);
	});
	it('are retrieved from --username and --password', () => {
		const argv = [
			'node',
			'checkee',
			'--username',
			'my-username',
			'--password',
			'my-password',
		];
		chai.expect(args.getArgs(argv).username).to.equal('my-username');
		chai.expect(args.getArgs(argv).password).to.equal('my-password');
	});
});
