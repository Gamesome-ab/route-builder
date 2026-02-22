import * as path from 'path';
import { fileURLToPath } from 'url';

import { describe, expect, it } from 'vitest';

import { generate, parseArgs } from './generate';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(currentDir, 'test-fixtures');

describe('parseArgs', () => {
	it('parses positional input file with defaults', () => {
		const parsed = parseArgs(['src/routes.ts']);

		expect(parsed).toEqual({
			inputFile: 'src/routes.ts',
			exportName: 'appRoutes',
			typeName: 'AppRoutes',
		});
	});

	it('parses all long flags', () => {
		const parsed = parseArgs([
			'src/routes.ts',
			'--out',
			'src/generated.ts',
			'--export',
			'myRoutes',
			'--type',
			'MyRoutes',
		]);

		expect(parsed).toEqual({
			inputFile: 'src/routes.ts',
			outputFile: 'src/generated.ts',
			exportName: 'myRoutes',
			typeName: 'MyRoutes',
		});
	});

	it('parses short flags', () => {
		const parsed = parseArgs([
			'src/routes.ts',
			'-o',
			'out.ts',
			'-e',
			'routes',
			'-t',
			'Routes',
		]);

		expect(parsed).toEqual({
			inputFile: 'src/routes.ts',
			outputFile: 'out.ts',
			exportName: 'routes',
			typeName: 'Routes',
		});
	});

	it('throws when a flag is missing its value', () => {
		expect(() => parseArgs(['src/routes.ts', '--out'])).toThrow(
			'Missing value for --out'
		);
		expect(() => parseArgs(['src/routes.ts', '--export'])).toThrow(
			'Missing value for --export'
		);
		expect(() => parseArgs(['src/routes.ts', '-t'])).toThrow(
			'Missing value for -t'
		);
	});
});

describe('generate', () => {
	it('generates types from a plain exported object', () => {
		const output = generate({
			inputFile: path.join(fixturesDir, 'simple-routes.ts'),
			exportName: 'appRoutes',
			typeName: 'AppRoutes',
		});

		expect(output).toContain(
			"import type { ExpandDeep } from '@gamesome/route-builder/generator';"
		);
		expect(output).toContain('type RawAppRoutes = {');
		expect(output).toContain('dashboard: {');
		expect(output).toContain('$: "/";');
		expect(output).toContain(
			'export type AppRoutes = ExpandDeep<RawAppRoutes>;'
		);
		expect(output).not.toContain('readonly ');
	});

	it('resolves buildRoutesWithGenerator through buildRoutes', () => {
		const output = generate({
			inputFile: path.join(fixturesDir, 'with-generator.ts'),
			exportName: 'appRoutes',
			typeName: 'AppRoutes',
		});

		expect(output).toContain('type RawAppRoutes = {');
		expect(output).toContain('$: "/";');
		expect(output).toContain('users: {');
		expect(output).toContain('$: "/users";');
	});

	it('resolves dynamic function routes with template literal return types', () => {
		const output = generate({
			inputFile: path.join(fixturesDir, 'with-dynamic-routes.ts'),
			exportName: 'myRoutes',
			typeName: 'MyRoutes',
		});

		// Static paths are string literals
		expect(output).toContain('$: "/";');
		expect(output).toContain('$: "/posts";');

		// Dynamic route is a function returning a template literal
		expect(output).toMatch(/id: \(postId: string\) => `/);

		// Nested function returning an object with its own routes
		expect(output).toMatch(/comments: \(postId: string\) => \{/);

		// The type name should reflect the custom --type flag
		expect(output).toContain('type RawMyRoutes = {');
		expect(output).toContain('export type MyRoutes = ExpandDeep<RawMyRoutes>;');
	});

	it('throws when the requested export is missing', () => {
		expect(() =>
			generate({
				inputFile: path.join(fixturesDir, 'simple-routes.ts'),
				exportName: 'missingExport',
				typeName: 'Missing',
			})
		).toThrow('Could not find exported variable "missingExport"');
	});
});
