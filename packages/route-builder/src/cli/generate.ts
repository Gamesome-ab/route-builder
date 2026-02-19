#!/usr/bin/env node
import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';

export interface GenerateOptions {
	inputFile: string;
	outputFile?: string;
	exportName?: string;
	typeName?: string;
}

export function parseArgs(args: string[]): GenerateOptions {
	const options: GenerateOptions = {
		inputFile: '',
		exportName: 'appRoutes',
		typeName: 'AppRoutes',
	};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		const nextArg = args[i + 1];
		if (arg === '--out' || arg === '-o') {
			if (!nextArg || nextArg.startsWith('-')) {
				throw new Error(`Missing value for ${arg}`);
			}
			options.outputFile = args[++i];
		} else if (arg === '--export' || arg === '-e') {
			if (!nextArg || nextArg.startsWith('-')) {
				throw new Error(`Missing value for ${arg}`);
			}
			options.exportName = args[++i];
		} else if (arg === '--type' || arg === '-t') {
			if (!nextArg || nextArg.startsWith('-')) {
				throw new Error(`Missing value for ${arg}`);
			}
			options.typeName = args[++i];
		} else if (!arg.startsWith('-')) {
			options.inputFile = arg;
		}
	}

	return options;
}

export function getResolvedTypeString(
	checker: ts.TypeChecker,
	type: ts.Type,
	depth = 0
): string {
	const indent = '\t'.repeat(depth);
	const childIndent = '\t'.repeat(depth + 1);

	// Handle function types
	if (type.getCallSignatures().length > 0) {
		const sig = type.getCallSignatures()[0];
		const params = sig.getParameters();
		const paramStrs = params.map((p) => {
			const paramType = checker.getTypeOfSymbol(p);
			// For rest/tuple parameters, extract individual types
			if (paramType.flags & ts.TypeFlags.Object) {
				const typeNode = checker.typeToString(paramType);
				// Check if it's a tuple like [userId: string]
				if (typeNode.startsWith('[') && typeNode.endsWith(']')) {
					// Extract the inner part: "userId: string" from "[userId: string]"
					return typeNode.slice(1, -1);
				}
			}
			return `${p.name}: ${checker.typeToString(paramType)}`;
		});
		const returnType = sig.getReturnType();
		const returnTypeStr = getResolvedTypeString(checker, returnType, depth);
		return `(${paramStrs.join(', ')}) => ${returnTypeStr}`;
	}

	// Handle string literal types
	if (type.isStringLiteral()) {
		return `"${type.value}"`;
	}

	// Handle template literal types - check for intrinsic name
	const typeStr = checker.typeToString(type);
	if (typeStr.startsWith('`') && typeStr.endsWith('`')) {
		return typeStr; // Return template literal as-is
	}

	// Handle template literal types or string types
	if (type.flags & ts.TypeFlags.String) {
		return 'string';
	}

	// Handle union types (like template literals that resolve to string patterns)
	if (type.isUnion()) {
		const types = type.types.map((t) =>
			getResolvedTypeString(checker, t, depth)
		);
		return types.join(' | ');
	}

	// Handle object types
	if (type.flags & ts.TypeFlags.Object) {
		const properties = type.getProperties();
		if (properties.length === 0) {
			return checker.typeToString(type);
		}

		const propStrings = properties.map((prop) => {
			// Use getTypeOfSymbol instead of getTypeOfSymbolAtLocation
			const propType = checker.getTypeOfSymbol(prop);
			const typeStr = getResolvedTypeString(checker, propType, depth + 1);
			return `${childIndent}${prop.name}: ${typeStr};`;
		});

		return `{\n${propStrings.join('\n')}\n${indent}}`;
	}

	// Fallback
	return checker.typeToString(type);
}

export function generate(options: GenerateOptions): string {
	const { inputFile, exportName, typeName } = options;

	const absoluteInput = path.resolve(inputFile);
	const inputDir = path.dirname(absoluteInput);

	// Try to find tsconfig.json
	const configPath = ts.findConfigFile(
		inputDir,
		ts.sys.fileExists,
		'tsconfig.json'
	);
	let compilerOptions: ts.CompilerOptions = {
		target: ts.ScriptTarget.ESNext,
		module: ts.ModuleKind.ESNext,
		moduleResolution: ts.ModuleResolutionKind.Bundler,
		strict: true,
		skipLibCheck: true,
		esModuleInterop: true,
	};

	if (configPath) {
		const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
		if (!configFile.error) {
			const parsed = ts.parseJsonConfigFileContent(
				configFile.config,
				ts.sys,
				path.dirname(configPath)
			);
			compilerOptions = { ...compilerOptions, ...parsed.options };
		}
	}

	// Create a program to analyze the file
	const program = ts.createProgram([absoluteInput], compilerOptions);

	const checker = program.getTypeChecker();
	const sourceFile = program.getSourceFile(absoluteInput);

	if (!sourceFile) {
		throw new Error(`Could not load source file: ${absoluteInput}`);
	}

	let resolvedType: string | null = null;

	// Helper to find buildRoutes/buildRoutesWithGenerator calls and extract the config argument text
	function findBuildRoutesCallAndConfig(
		node: ts.Node
	): { call: ts.CallExpression; configText: string } | undefined {
		if (ts.isCallExpression(node)) {
			const expr = node.expression;
			if (ts.isIdentifier(expr)) {
				const name = expr.text;
				if (name === 'buildRoutes' || name === 'buildRoutesWithGenerator') {
					if (node.arguments.length > 0) {
						const configArg = node.arguments[0];
						const configText = configArg.getText(sourceFile);
						return { call: node, configText };
					}
				}
			}
		}
		return ts.forEachChild(node, findBuildRoutesCallAndConfig);
	}

	// Find the exported variable and get the type
	ts.forEachChild(sourceFile, (node) => {
		if (ts.isVariableStatement(node)) {
			for (const decl of node.declarationList.declarations) {
				if (ts.isIdentifier(decl.name) && decl.name.text === exportName) {
					if (decl.initializer) {
						// Check if it's a buildRoutes/buildRoutesWithGenerator call
						const result = findBuildRoutesCallAndConfig(decl.initializer);

						if (result) {
							const { call, configText } = result;
							const callExpr = call.expression as ts.Identifier;

							// If using buildRoutesWithGenerator, we need to create a virtual file
							// that calls buildRoutes instead to get the proper type
							if (callExpr.text === 'buildRoutesWithGenerator') {
								// Create a virtual source file that imports and calls buildRoutes
								const virtualFileName = absoluteInput.replace(
									/\.ts$/,
									'.virtual.ts'
								);
								const virtualSource = `
import { buildRoutes } from '@gamesome/route-builder';
const __result = buildRoutes(${configText});
export type __ResultType = typeof __result;
`;
								// Create a new program with the virtual file
								const virtualHost = ts.createCompilerHost(compilerOptions);
								const originalGetSourceFile =
									virtualHost.getSourceFile.bind(virtualHost);
								virtualHost.getSourceFile = (
									fileName,
									languageVersion,
									onError,
									shouldCreateNewSourceFile
								) => {
									if (fileName === virtualFileName) {
										return ts.createSourceFile(
											virtualFileName,
											virtualSource,
											languageVersion,
											true
										);
									}
									return originalGetSourceFile(
										fileName,
										languageVersion,
										onError,
										shouldCreateNewSourceFile
									);
								};
								virtualHost.fileExists = (fileName) => {
									if (fileName === virtualFileName) return true;
									return ts.sys.fileExists(fileName);
								};
								virtualHost.readFile = (fileName) => {
									if (fileName === virtualFileName) return virtualSource;
									return ts.sys.readFile(fileName);
								};

								const virtualProgram = ts.createProgram(
									[virtualFileName],
									compilerOptions,
									virtualHost
								);
								const virtualChecker = virtualProgram.getTypeChecker();
								const virtualSourceFile =
									virtualProgram.getSourceFile(virtualFileName);

								if (virtualSourceFile) {
									// Find the __result variable and get its type
									ts.forEachChild(virtualSourceFile, (vNode) => {
										if (ts.isVariableStatement(vNode)) {
											for (const vDecl of vNode.declarationList.declarations) {
												if (
													ts.isIdentifier(vDecl.name) &&
													vDecl.name.text === '__result'
												) {
													if (vDecl.initializer) {
														const type = virtualChecker.getTypeAtLocation(
															vDecl.initializer
														);
														resolvedType = getResolvedTypeString(
															virtualChecker,
															type,
															0
														);
													}
												}
											}
										}
									});
								}
							} else {
								// Direct buildRoutes call - get type directly
								const callType = checker.getTypeAtLocation(call);
								resolvedType = getResolvedTypeString(checker, callType, 0);
							}
						} else {
							// Not a buildRoutes call, just get the type directly
							const type = checker.getTypeAtLocation(decl.initializer);
							resolvedType = getResolvedTypeString(checker, type, 0);
						}
					}
				}
			}
		}
	});

	if (!resolvedType) {
		throw new Error(
			`Could not find exported variable "${exportName}" in ${inputFile}`
		);
	}

	const output = `// Generated by @gamesome/route-builder
// Do not edit this file manually

import type { ExpandDeep } from '@gamesome/route-builder';

type Raw${typeName} = ${resolvedType};

export type ${typeName} = ExpandDeep<Raw${typeName}>;
`;

	return output;
}

export function main() {
	const args = process.argv.slice(2);

	if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
		console.log(`
Usage: route-builder-generate <input-file> [options]

Options:
  --out, -o <file>     Output file path (default: stdout)
  --export, -e <name>  Name of the exported variable to generate types for (default: appRoutes)
  --type, -t <name>    Name for the generated type (default: AppRoutes)
  --help, -h           Show this help message

Example:
  route-builder-generate src/routes.ts --out src/routes.generated.ts
  route-builder-generate src/routes.ts -o src/routes.generated.ts -e myRoutes -t MyRoutes
`);
		process.exit(0);
	}

	const options = parseArgs(args);

	if (!options.inputFile) {
		console.error('Error: No input file specified');
		process.exit(1);
	}

	try {
		const output = generate(options);

		if (options.outputFile) {
			const absoluteOutput = path.resolve(options.outputFile);
			fs.mkdirSync(path.dirname(absoluteOutput), { recursive: true });
			fs.writeFileSync(absoluteOutput, output);
			console.log(`Generated: ${absoluteOutput}`);
		} else {
			console.log(output);
		}
	} catch (error) {
		console.error('Error:', (error as Error).message);
		process.exit(1);
	}
}

function isCliEntrypoint() {
	const entrypoint = process.argv[1];
	if (!entrypoint) return false;
	return import.meta.url === pathToFileURL(entrypoint).href;
}

if (isCliEntrypoint()) {
	main();
}
