import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parsePackages } from '../../src/collectors/package-parser.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(__dirname, '../fixtures/mock-manifests');
const fixturesBase = path.join(__dirname, '../fixtures');

describe('parsePackages', () => {
  it('parses package.json correctly', async () => {
    const result = await parsePackages(fixturesDir);
    expect(result).not.toBeNull();
    expect(result!.name).toBe('my-app');
    expect(result!.version).toBe('2.1.0');
    expect(result!.dependencyCount).toBe(3);
    expect(result!.devDependencyCount).toBe(2);
    expect(result!.packageManager).toBe('npm');
  });

  it('detects yarn as package manager', async () => {
    const result = await parsePackages(path.join(fixturesBase, 'yarn-project'));
    expect(result).not.toBeNull();
    expect(result!.packageManager).toBe('yarn');
  });

  it('parses Cargo.toml correctly', async () => {
    const result = await parsePackages(path.join(fixturesBase, 'cargo-only'));
    expect(result).not.toBeNull();
    expect(result!.name).toBe('my-rust-app');
    expect(result!.version).toBe('0.3.1');
    expect(result!.dependencyCount).toBe(3);
    expect(result!.packageManager).toBe('cargo');
  });

  it('parses go.mod correctly', async () => {
    const result = await parsePackages(path.join(fixturesBase, 'go-only'));
    expect(result).not.toBeNull();
    expect(result!.name).toBe('my-go-app');
    expect(result!.dependencyCount).toBe(3);
    expect(result!.packageManager).toBe('go modules');
  });

  it('parses pubspec.yaml correctly', async () => {
    const result = await parsePackages(path.join(fixturesBase, 'pubspec-only'));
    expect(result).not.toBeNull();
    expect(result!.name).toBe('my_flutter_app');
    expect(result!.version).toBe('1.0.0+1');
    expect(result!.packageManager).toBe('pub');
  });

  it('parses pyproject.toml correctly', async () => {
    const result = await parsePackages(path.join(fixturesBase, 'pyproject-only'));
    expect(result).not.toBeNull();
    expect(result!.name).toBe('my-python-app');
    expect(result!.version).toBe('0.2.0');
    expect(result!.packageManager).toBe('pip');
  });

  it('parses requirements.txt correctly', async () => {
    const result = await parsePackages(path.join(fixturesBase, 'requirements-only'));
    expect(result).not.toBeNull();
    expect(result!.dependencyCount).toBe(3);
    expect(result!.packageManager).toBe('pip');
  });

  it('returns null for a directory with no manifest', async () => {
    const result = await parsePackages('/tmp/nonexistent-repo-xyz');
    expect(result).toBeNull();
  });
});
