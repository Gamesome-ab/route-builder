import * as path from 'path';
import { fileURLToPath } from 'url';

import { describe, expect, it } from 'vitest';

import { generate, parseArgs } from './generate';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(currentDir, 'test-fixtures');

describe('route-builder generate CLI', () => {
	it('parses args with defaults', () => {
		const parsed = parseArgs(['src/routes.ts']);

		expect(parsed).toEqual({
			inputFile: 'src/routes.ts',
			exportName: 'appRoutes',
			typeName: 'AppRoutes',
		});
	});

	it('generates an expanded type file from a plain exported object', () => {
		const output = generate({
			inputFile: path.join(fixturesDir, 'simple-routes.ts'),
			exportName: 'appRoutes',
			typeName: 'AppRoutes',
		});

		expect(output).toContain(
			"import type { ExpandDeep } from '@gamesome/route-builder';"
		);
		expect(output).toContain('type RawAppRoutes = {');
		expect(output).toContain('dashboard: {');
		expect(output).toContain('$: "/";');
		expect(output).toContain(
			'export type AppRoutes = ExpandDeep<RawAppRoutes>;'
		);
		expect(output).not.toContain('readonly ');
	});

	it('handles buildRoutesWithGenerator by resolving through buildRoutes', () => {
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
