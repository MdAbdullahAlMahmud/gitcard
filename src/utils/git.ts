import simpleGit, { SimpleGit } from 'simple-git';

export function createGit(repoPath: string): SimpleGit {
  return simpleGit(repoPath);
}

export async function getRemoteUrl(repoPath: string): Promise<string | null> {
  try {
    const git = createGit(repoPath);
    const remotes = await git.getRemotes(true);
    const origin = remotes.find((r) => r.name === 'origin') ?? remotes[0];
    return origin?.refs?.fetch ?? null;
  } catch {
    return null;
  }
}

export async function getDefaultBranch(repoPath: string): Promise<string> {
  try {
    const git = createGit(repoPath);
    const result = await git.revparse(['--abbrev-ref', 'HEAD']);
    return result.trim() || 'main';
  } catch {
    return 'main';
  }
}

export async function getFirstCommitDate(repoPath: string): Promise<string | null> {
  try {
    const git = createGit(repoPath);
    const log = await git.log(['--reverse', '--format=%aI', '--max-parents=0']);
    return log.latest?.date ?? null;
  } catch {
    return null;
  }
}

export async function getContributorCount(repoPath: string): Promise<number> {
  try {
    const git = createGit(repoPath);
    const result = await git.raw(['shortlog', '-s', '-n', 'HEAD']);
    return result.trim().split('\n').filter(Boolean).length;
  } catch {
    return 0;
  }
}

export async function isGitRepo(repoPath: string): Promise<boolean> {
  try {
    const git = createGit(repoPath);
    await git.status();
    return true;
  } catch {
    return false;
  }
}
