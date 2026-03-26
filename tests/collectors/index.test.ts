import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockScanResult = {
  repoName: 'test-repo',
  remoteUrl: 'https://github.com/owner/test-repo.git',
  defaultBranch: 'main',
  totalFiles: 10,
  totalSizeBytes: 1000,
  totalCommits: 5,
  contributorCount: 2,
  firstCommitDate: null,
  languages: [],
  recentCommits: [],
  weeklyActivity: [],
};

const mockPackageData = {
  name: 'test-repo',
  version: '1.0.0',
  dependencyCount: 3,
  devDependencyCount: 2,
  packageManager: 'npm',
};

const mockGithubData = {
  stars: 42,
  forks: 7,
  openIssues: 1,
  watchers: 10,
  topics: ['nodejs'],
  description: 'A test repo',
  license: 'MIT',
  homepage: null,
};

vi.mock('../../src/collectors/repo-scanner.js', () => ({
  scanRepo: vi.fn(),
}));

vi.mock('../../src/collectors/package-parser.js', () => ({
  parsePackages: vi.fn(),
}));

vi.mock('../../src/collectors/github-api.js', () => ({
  fetchGithubData: vi.fn(),
}));

import { runCollectors } from '../../src/collectors/index.js';
import { scanRepo } from '../../src/collectors/repo-scanner.js';
import { parsePackages } from '../../src/collectors/package-parser.js';
import { fetchGithubData } from '../../src/collectors/github-api.js';

describe('runCollectors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(scanRepo).mockResolvedValue(mockScanResult);
    vi.mocked(parsePackages).mockResolvedValue(mockPackageData);
    vi.mocked(fetchGithubData).mockResolvedValue(mockGithubData);
  });

  it('returns scan, packages, and github data', async () => {
    const result = await runCollectors('/repo', {});
    expect(result.scan).toEqual(mockScanResult);
    expect(result.packages).toEqual(mockPackageData);
    expect(result.github).toEqual(mockGithubData);
  });

  it('skips github fetch when noGithub is true', async () => {
    const result = await runCollectors('/repo', { noGithub: true });
    expect(result.github).toBeNull();
    expect(fetchGithubData).not.toHaveBeenCalled();
  });

  it('returns null packages when parsePackages fails', async () => {
    vi.mocked(parsePackages).mockRejectedValue(new Error('parse error'));
    const result = await runCollectors('/repo', { noGithub: true });
    expect(result.packages).toBeNull();
  });

  it('passes token to fetchGithubData', async () => {
    await runCollectors('/repo', { token: 'ghp_test123' });
    expect(fetchGithubData).toHaveBeenCalledWith(mockScanResult.remoteUrl, 'ghp_test123');
  });
});
