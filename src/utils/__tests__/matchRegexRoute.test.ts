import { matchRegexRoute } from '../matchRegexRoute';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';

describe('matchRegexRoute()', () => {
	const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

	afterEach(() => {
		warnSpy.mockClear();
		vi.clearAllMocks();
	});

	afterAll(() => {
		vi.restoreAllMocks();
	});

	it('matches correctly when expecting positive result', () => {
		expect(matchRegexRoute('/path/:parameter', '/path/foo')).toEqual({
			params: { parameter: 'foo' },
		});
		expect(matchRegexRoute('/:resource/:id', '/path/subpath')).toEqual({
			params: { id: 'subpath', resource: 'path' },
		});
		expect(
			matchRegexRoute('/:part1-:part2-:part3', '/test1-test2-test3'),
		).toEqual({
			params: { part1: 'test1', part2: 'test2', part3: 'test3' },
		});
		expect(matchRegexRoute('/:foo/*', '/test/route')).toEqual({
			params: { $rest: 'route', foo: 'test' },
		});
		expect(matchRegexRoute('/:foo/*', '/test/route/child')).toEqual({
			params: { $rest: 'route/child', foo: 'test' },
		});
		expect(matchRegexRoute('/:foo*', '/bar/baz')).toEqual({
			params: { $rest: '/baz', foo: 'bar' },
		});
		expect(
			matchRegexRoute(
				'/:foo/file/prefix-*.:extension',
				'/bar/file/prefix-baz.js',
			),
		).toEqual({
			params: { $rest: 'baz', extension: 'js', foo: 'bar' },
		});
		expect(
			matchRegexRoute(
				'/search/:tableName?useIndex=true&term=amazing',
				'/search/people?useIndex=true&term=amazing',
			),
		).toEqual({
			params: { tableName: 'people' },
		});

		expect(console.warn).not.toHaveBeenCalled();
	});

	it('matches correctly when expecting negative result', () => {
		expect(matchRegexRoute('/path/subpath', '/path/sub-path')).toEqual(null);
		expect(matchRegexRoute('/path/:parameter', '/path/foo/bar')).toEqual(null);
		expect(matchRegexRoute('/:foo/:bar', '/foo/bar/baz')).toEqual(null);
		expect(
			matchRegexRoute('/:part1-:part2-:part3', '/test1/test2/test3'),
		).toEqual(null);
		expect(matchRegexRoute('/:foo/file/*.js', '/bar/file/baz.jsx')).toEqual(
			null,
		);

		expect(
			matchRegexRoute(
				'/search/:resource?useIndex=true&term=amazing',
				'/search/people?term=amazing&useIndex=true',
			),
		).toEqual(null);

		expect(console.warn).not.toHaveBeenCalled();
	});

	it('should only return first matched named parameter if two or more are in pattern', () => {
		expect(matchRegexRoute('/:foo/:foo', '/foo/bar')).toEqual({
			params: { foo: 'foo' },
		});

		expect(matchRegexRoute('/:foo/*/*', '/test/route/child')).toEqual({
			params: { $rest: 'route', foo: 'test' },
		});

		/* eslint-disable no-console */
		expect(console.warn).toHaveBeenCalledTimes(2);
		expect(console.warn).toHaveBeenNthCalledWith(
			1,
			"Path '/:foo/:foo' had multiple route parameters of same name 'foo'.",
		);
		expect(console.warn).toHaveBeenNthCalledWith(
			2,
			"Path '/:foo/*/*' had multiple route parameters of same name '$rest'.",
		);
	});

	it('should match with expected $rest param', () => {
		expect(
			matchRegexRoute(
				'/:companySlug/assessment/:slug/code/tree/*',
				'/acme/assessment/repo/code/tree/.eslintrc',
			),
		).toEqual({
			params: {
				companySlug: 'acme',
				slug: 'repo',
				$rest: '.eslintrc',
			},
		});

		expect(
			matchRegexRoute(
				'/:companySlug/assessment/:slug/code/tree/*',
				'/acme/assessment/repo/code/tree/src/some-deep/file.js',
			),
		).toEqual({
			params: {
				companySlug: 'acme',
				slug: 'repo',
				$rest: 'src/some-deep/file.js',
			},
		});
	});
});
