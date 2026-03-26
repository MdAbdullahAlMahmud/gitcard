import path from 'node:path';
import fs from 'node:fs/promises';
import type { PackageData } from '../types.js';

async function readFile(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}

async function parseNpm(repoPath: string): Promise<PackageData | null> {
  const content = await readFile(path.join(repoPath, 'package.json'));
  if (!content) return null;
  try {
    const pkg = JSON.parse(content);
    const deps = Object.keys(pkg.dependencies ?? {}).length;
    const devDeps = Object.keys(pkg.devDependencies ?? {}).length;
    // Detect package manager from lock file
    const [hasYarn, hasPnpm, hasBun] = await Promise.all([
      readFile(path.join(repoPath, 'yarn.lock')),
      readFile(path.join(repoPath, 'pnpm-lock.yaml')),
      readFile(path.join(repoPath, 'bun.lockb')),
    ]);
    let packageManager = 'npm';
    if (hasBun) packageManager = 'bun';
    else if (hasPnpm) packageManager = 'pnpm';
    else if (hasYarn) packageManager = 'yarn';

    return {
      name: pkg.name ?? null,
      version: pkg.version ?? null,
      dependencyCount: deps,
      devDependencyCount: devDeps,
      packageManager,
    };
  } catch {
    return null;
  }
}

async function parseCargo(repoPath: string): Promise<PackageData | null> {
  const content = await readFile(path.join(repoPath, 'Cargo.toml'));
  if (!content) return null;
  const nameMatch = content.match(/^\s*name\s*=\s*"([^"]+)"/m);
  const versionMatch = content.match(/^\s*version\s*=\s*"([^"]+)"/m);
  const depMatches = content.match(/\[dependencies\]\n([\s\S]*?)(?=\n\[|$)/);
  const deps = depMatches
    ? depMatches[1].split('\n').filter((l) => l.trim() && !l.startsWith('#')).length
    : 0;
  return {
    name: nameMatch?.[1] ?? null,
    version: versionMatch?.[1] ?? null,
    dependencyCount: deps,
    devDependencyCount: 0,
    packageManager: 'cargo',
  };
}

async function parseGoMod(repoPath: string): Promise<PackageData | null> {
  const content = await readFile(path.join(repoPath, 'go.mod'));
  if (!content) return null;
  const moduleMatch = content.match(/^module\s+(\S+)/m);
  const requireBlock = content.match(/^require\s*\(([\s\S]*?)\)/m);
  const deps = requireBlock
    ? requireBlock[1]
        .split('\n')
        .filter((l) => l.trim() && !l.trim().startsWith('//') && !l.trim().startsWith(')')).length
    : 0;
  const name = moduleMatch?.[1]?.split('/').pop() ?? null;
  return {
    name,
    version: null,
    dependencyCount: deps,
    devDependencyCount: 0,
    packageManager: 'go modules',
  };
}

async function parsePubspec(repoPath: string): Promise<PackageData | null> {
  const content = await readFile(path.join(repoPath, 'pubspec.yaml'));
  if (!content) return null;
  const nameMatch = content.match(/^name:\s*(.+)/m);
  const versionMatch = content.match(/^version:\s*(.+)/m);
  const depsMatch = content.match(/^dependencies:\s*\n([\s\S]*?)(?=^\w|$)/m);
  const deps = depsMatch
    ? depsMatch[1].split('\n').filter((l) => /^\s{2}\w/.test(l) && !l.includes('flutter:')).length
    : 0;
  return {
    name: nameMatch?.[1]?.trim() ?? null,
    version: versionMatch?.[1]?.trim() ?? null,
    dependencyCount: deps,
    devDependencyCount: 0,
    packageManager: 'pub',
  };
}

async function parsePyproject(repoPath: string): Promise<PackageData | null> {
  const content = await readFile(path.join(repoPath, 'pyproject.toml'));
  if (!content) return null;
  const nameMatch = content.match(/^\s*name\s*=\s*"([^"]+)"/m);
  const versionMatch = content.match(/^\s*version\s*=\s*"([^"]+)"/m);
  const depsSection = content.match(/^\[tool\.poetry\.dependencies\]([\s\S]*?)(?=^\[|$)/m);
  const deps = depsSection
    ? depsSection[1].split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#')).length
    : 0;
  return {
    name: nameMatch?.[1] ?? null,
    version: versionMatch?.[1] ?? null,
    dependencyCount: deps,
    devDependencyCount: 0,
    packageManager: 'pip',
  };
}

async function parseRequirements(repoPath: string): Promise<PackageData | null> {
  const content = await readFile(path.join(repoPath, 'requirements.txt'));
  if (!content) return null;
  const deps = content.split('\n').filter((l) => l.trim() && !l.startsWith('#')).length;
  return {
    name: null,
    version: null,
    dependencyCount: deps,
    devDependencyCount: 0,
    packageManager: 'pip',
  };
}

export async function parsePackages(repoPath: string): Promise<PackageData | null> {
  // Try in priority order
  const parsers = [
    parseNpm,
    parseCargo,
    parseGoMod,
    parsePubspec,
    parsePyproject,
    parseRequirements,
  ];

  for (const parser of parsers) {
    const result = await parser(repoPath);
    if (result) return result;
  }
  return null;
}
