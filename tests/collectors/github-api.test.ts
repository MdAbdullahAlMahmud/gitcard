import { describe, it, expect } from 'vitest';
import { parseRemoteUrl, fetchGithubData } from '../../src/collectors/github-api.js';

describe('parseRemoteUrl', () => {
  it('parses HTTPS remote URL', () => {
    const result = parseRemoteUrl('https://github.com/owner/my-repo.git');
    expect(result).toEqual({ owner: 'owner', repo: 'my-repo' });
  });

  it('parses SSH remote URL', () => {
    const result = parseRemoteUrl('git@github.com:owner/my-repo.git');
    expect(result).toEqual({ owner: 'owner', repo: 'my-repo' });
  });

  it('parses HTTPS URL without .git suffix', () => {
    const result = parseRemoteUrl('https://github.com/owner/my-repo');
    expect(result).toEqual({ owner: 'owner', repo: 'my-repo' });
  });

  it('returns null for non-GitHub remote', () => {
    const result = parseRemoteUrl('https://gitlab.com/owner/my-repo.git');
    expect(result).toBeNull();
  });

  it('returns null for invalid URL', () => {
    const result = parseRemoteUrl('not-a-url');
    expect(result).toBeNull();
  });
});

describe('fetchGithubData', () => {
  it('returns null when remoteUrl is null', async () => {
    const result = await fetchGithubData(null);
    expect(result).toBeNull();
  });

  it('returns null for non-GitHub remote', async () => {
    const result = await fetchGithubData('https://gitlab.com/owner/repo.git');
    expect(result).toBeNull();
  });

  it('returns null on API error', async () => {
    // Uses a made-up repo — will 404, should return null gracefully
    const result = await fetchGithubData('https://github.com/xxxxnonexistentowner99999/xxxxrepo99999');
    expect(result).toBeNull();
  });
});
