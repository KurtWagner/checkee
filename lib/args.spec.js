'use strict';

const chai = require('chai');
const args = require('./args');

describe('messageIdentifier argument', () => {
	it('is optional', () => {
		const argv = [
			'node',
			'checkee',
		];
		const got = args.getArgs({argv:argv}).messageIdentifier;
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
		const got = args.getArgs({argv:argv}).messageIdentifier;
		const expected = 'abc';
		chai.expect(got).to.equal(expected);
	});
});
