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

describe('android-lint argument', () => {
	it('is optional', () => {
		const argv = [
			'node',
			'checkee',
		];
		chai.expect(args.getArgs(argv).androidLintFilePaths).to.deep.equal([]);
	});
	it('retrieves from --android-lint into androidLintFilePaths', () => {
		const argv = [
			'node',
			'checkee',
			'--android-lint',
			'path/result.xml',
		];
		chai.expect(args.getArgs(argv).androidLintFilePaths).to.deep.equal(['path/result.xml']);
	});
	it('retrieves many from --android-lint into androidLintFilePaths', () => {
		const argv = [
			'node',
			'checkee',
			'--android-lint',
			'path/result-1.xml',
			'--android-lint',
			'path/result-2.xml',
		];
		chai.expect(args.getArgs(argv).androidLintFilePaths).to.deep.equal([
			'path/result-1.xml',
			'path/result-2.xml',
		]);
	});
});

describe('--checkstyle/-c argument', () => {
	it('is optional', () => {
		const argv = [
			'node',
			'checkee',
		];
		chai.expect(args.getArgs(argv).checkstyleFilePaths).to.deep.equal([]);
	});
	it('retrieves from --checkstyle into checkstyleFilePaths', () => {
		const argv = [
			'node',
			'checkee',
			'--checkstyle',
			'path/result.xml',
		];
		chai.expect(args.getArgs(argv).checkstyleFilePaths).to.deep.equal(['path/result.xml']);
	});
	it('retrieves many from --checkstyle into checkstyleFilePaths', () => {
		const argv = [
			'node',
			'checkee',
			'--checkstyle',
			'path/result-1.xml',
			'--checkstyle',
			'path/result-2.xml',
		];
		chai.expect(args.getArgs(argv).checkstyleFilePaths).to.deep.equal([
			'path/result-1.xml',
			'path/result-2.xml',
		]);
	});
	it('retrieves from -c into checkstyleFilePaths', () => {
		const argv = [
			'node',
			'checkee',
			'-c',
			'path/result.xml',
		];
		chai.expect(args.getArgs(argv).checkstyleFilePaths).to.deep.equal(['path/result.xml']);
	});
	it('retrieves many from -c into checkstyleFilePaths', () => {
		const argv = [
			'node',
			'checkee',
			'-c',
			'path/result-1.xml',
			'-c',
			'path/result-2.xml',
		];
		chai.expect(args.getArgs(argv).checkstyleFilePaths).to.deep.equal([
			'path/result-1.xml',
			'path/result-2.xml',
		]);
	});
});
