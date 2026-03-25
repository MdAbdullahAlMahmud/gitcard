import { Octokit } from '@octokit/rest';
import type { GithubData } from '../types.js';

export function parseRemoteUrl(remoteUrl: string): { owner: string; repo: string } | null {
  // HTTPS: https://github.com/owner/repo.git
  const httpsMatch = remoteUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)(?:\.git)?/);
  if (httpsMatch) {
    return { owner: httpsMatch[1], repo: httpsMatch[2] };
  }
  // SSH: git@github.com:owner/repo.git
  const sshMatch = remoteUrl.match(/git@github\.com:([^/]+)\/([^/.]+)(?:\.git)?/);
  if (sshMatch) {
    return { owner: sshMatch[1], repo: sshMatch[2] };
  }
  return null;
}

export async function fetchGithubData(
  remoteUrl: string | null,
  token?: string,
): Promise<GithubData | null> {
  if (!remoteUrl) return null;

  const parsed = parseRemoteUrl(remoteUrl);
  if (!parsed) return null;

  const { owner, repo } = parsed;

  try {
    const octokit = new Octokit({ auth: token });
    const { data } = await octokit.rest.repos.get({ owner, repo });

    return {
      stars: data.stargazers_count,
      forks: data.forks_count,
      openIssues: data.open_issues_count,
      topics: data.topics ?? [],
      description: data.description,
      license: data.license?.spdx_id ?? null,
      owner: data.owner.login,
      repo: data.name,
      avatarUrl: data.owner.avatar_url,
    };
  } catch {
    return null;
  }
}
