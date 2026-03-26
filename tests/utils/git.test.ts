import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGit = {
  getRemotes: vi.fn(),
  revparse: vi.fn(),
  log: vi.fn(),
  raw: vi.fn(),
  status: vi.fn(),
};

vi.mock('simple-git', () => ({
  default: vi.fn(() => mockGit),
}));

import {
  createGit,
  getRemoteUrl,
  getDefaultBranch,
  getFirstCommitDate,
  getContributorCount,
  isGitRepo,
} from '../../src/utils/git.js';

describe('createGit', () => {
  it('returns a git instance', () => {
    const git = createGit('/some/path');
    expect(git).toBeTruthy();
  });
});

describe('getRemoteUrl', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns fetch URL of origin remote', async () => {
    mockGit.getRemotes.mockResolvedValue([
      { name: 'origin', refs: { fetch: 'https://github.com/owner/repo.git' } },
    ]);
    const result = await getRemoteUrl('/repo');
    expect(result).toBe('https://github.com/owner/repo.git');
  });

  it('returns first remote if no origin', async () => {
    mockGit.getRemotes.mockResolvedValue([
      { name: 'upstream', refs: { fetch: 'https://github.com/upstream/repo.git' } },
    ]);
    const result = await getRemoteUrl('/repo');
    expect(result).toBe('https://github.com/upstream/repo.git');
  });

  it('returns null when no remotes', async () => {
    mockGit.getRemotes.mockResolvedValue([]);
    const result = await getRemoteUrl('/repo');
    expect(result).toBeNull();
  });

  it('returns null on error', async () => {
    mockGit.getRemotes.mockRejectedValue(new Error('not a repo'));
    const result = await getRemoteUrl('/repo');
    expect(result).toBeNull();
  });
});

describe('getDefaultBranch', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns current branch name', async () => {
    mockGit.revparse.mockResolvedValue('main\n');
    const result = await getDefaultBranch('/repo');
    expect(result).toBe('main');
  });

  it('returns "main" on empty result', async () => {
    mockGit.revparse.mockResolvedValue('   ');
    const result = await getDefaultBranch('/repo');
    expect(result).toBe('main');
  });

  it('returns "main" on error', async () => {
    mockGit.revparse.mockRejectedValue(new Error('fail'));
    const result = await getDefaultBranch('/repo');
    expect(result).toBe('main');
  });
});

describe('getFirstCommitDate', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns date of first commit', async () => {
    mockGit.log.mockResolvedValue({ latest: { date: '2023-01-01T00:00:00Z' } });
    const result = await getFirstCommitDate('/repo');
    expect(result).toBe('2023-01-01T00:00:00Z');
  });

  it('returns null when no commits', async () => {
    mockGit.log.mockResolvedValue({ latest: null });
    const result = await getFirstCommitDate('/repo');
    expect(result).toBeNull();
  });

  it('returns null on error', async () => {
    mockGit.log.mockRejectedValue(new Error('fail'));
    const result = await getFirstCommitDate('/repo');
    expect(result).toBeNull();
  });
});

describe('getContributorCount', () => {
  beforeEach(() => vi.clearAllMocks());

  it('counts contributors from shortlog output', async () => {
    mockGit.raw.mockResolvedValue('   5\tAlice\n   3\tBob\n   1\tCarol\n');
    const result = await getContributorCount('/repo');
    expect(result).toBe(3);
  });

  it('returns 0 on error', async () => {
    mockGit.raw.mockRejectedValue(new Error('fail'));
    const result = await getContributorCount('/repo');
    expect(result).toBe(0);
  });
});

describe('isGitRepo', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns true for a valid git repo', async () => {
    mockGit.status.mockResolvedValue({});
    const result = await isGitRepo('/repo');
    expect(result).toBe(true);
  });

  it('returns false when git status throws', async () => {
    mockGit.status.mockRejectedValue(new Error('not a repo'));
    const result = await isGitRepo('/repo');
    expect(result).toBe(false);
  });
});
