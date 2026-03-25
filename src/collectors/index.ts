import { scanRepo } from './repo-scanner.js';
import { parsePackages } from './package-parser.js';
import { fetchGithubData } from './github-api.js';
import type { RepoScanResult, PackageData, GithubData } from '../types.js';

export interface CollectorResults {
  scan: RepoScanResult;
  packages: PackageData | null;
  github: GithubData | null;
}

export async function runCollectors(
  repoPath: string,
  options: { noGithub?: boolean; token?: string },
): Promise<CollectorResults> {
  // Run scan first to get remote URL for GitHub call
  const scan = await scanRepo(repoPath);

  const [packagesResult, githubResult] = await Promise.allSettled([
    parsePackages(repoPath),
    options.noGithub
      ? Promise.resolve(null)
      : fetchGithubData(scan.remoteUrl, options.token),
  ]);

  return {
    scan,
    packages: packagesResult.status === 'fulfilled' ? packagesResult.value : null,
    github: githubResult.status === 'fulfilled' ? githubResult.value : null,
  };
}

export { scanRepo } from './repo-scanner.js';
export { parsePackages } from './package-parser.js';
export { fetchGithubData } from './github-api.js';
