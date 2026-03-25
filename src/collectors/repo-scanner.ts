import path from 'node:path';
import fs from 'node:fs/promises';
import { createGit, getRemoteUrl, getDefaultBranch, getFirstCommitDate, getContributorCount } from '../utils/git.js';
import { getLanguageInfo } from '../languages.js';
import { formatRelativeDate } from '../utils/format.js';
import type { RepoScanResult, LanguageBreakdown, CommitInfo } from '../types.js';
import { MAX_RECENT_COMMITS, MAX_LANGUAGES } from '../constants.js';

interface FileStat {
  ext: string;
  bytes: number;
}

async function getFileStats(repoPath: string): Promise<FileStat[]> {
  const git = createGit(repoPath);
  // Get tracked files
  const output = await git.raw(['ls-files']);
  const files = output.trim().split('\n').filter(Boolean);

  const stats: FileStat[] = [];
  await Promise.all(
    files.map(async (file) => {
      try {
        const fullPath = path.join(repoPath, file);
        const stat = await fs.stat(fullPath);
        const ext = path.extname(file).slice(1).toLowerCase();
        if (ext) {
          stats.push({ ext, bytes: stat.size });
        }
      } catch {
        // Skip files that can't be stat'd
      }
    }),
  );
  return stats;
}

function buildLanguageBreakdown(fileStats: FileStat[]): LanguageBreakdown[] {
  const langMap = new Map<string, { color: string; fileCount: number; bytes: number }>();

  for (const { ext, bytes } of fileStats) {
    const info = getLanguageInfo(ext);
    if (!info) continue;
    const existing = langMap.get(info.name);
    if (existing) {
      existing.fileCount++;
      existing.bytes += bytes;
    } else {
      langMap.set(info.name, { color: info.color, fileCount: 1, bytes });
    }
  }

  const totalBytes = [...langMap.values()].reduce((sum, v) => sum + v.bytes, 0);
  if (totalBytes === 0) return [];

  return [...langMap.entries()]
    .map(([language, { color, fileCount, bytes }]) => ({
      language,
      color,
      fileCount,
      bytes,
      percentage: Math.round((bytes / totalBytes) * 100 * 10) / 10,
    }))
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, MAX_LANGUAGES);
}

async function getRecentCommits(repoPath: string): Promise<{ commits: CommitInfo[]; total: number }> {
  try {
    const git = createGit(repoPath);
    const log = await git.log({ maxCount: MAX_RECENT_COMMITS });
    const commits: CommitInfo[] = log.all.map((c) => ({
      hash: c.hash.slice(0, 7),
      message: c.message.split('\n')[0].slice(0, 72),
      author: c.author_name,
      date: c.date,
      relativeDate: formatRelativeDate(c.date),
    }));

    // Get total count
    const countOutput = await git.raw(['rev-list', '--count', 'HEAD']);
    const total = parseInt(countOutput.trim(), 10) || 0;

    return { commits, total };
  } catch {
    return { commits: [], total: 0 };
  }
}

export async function scanRepo(repoPath: string): Promise<RepoScanResult> {
  const [fileStats, remoteUrl, defaultBranch, firstCommitDate, contributorCount, commitData] =
    await Promise.all([
      getFileStats(repoPath),
      getRemoteUrl(repoPath),
      getDefaultBranch(repoPath),
      getFirstCommitDate(repoPath),
      getContributorCount(repoPath),
      getRecentCommits(repoPath),
    ]);

  const languages = buildLanguageBreakdown(fileStats);
  const totalFiles = fileStats.length;
  const totalSizeBytes = fileStats.reduce((sum, f) => sum + f.bytes, 0);

  return {
    totalFiles,
    totalSizeBytes,
    languages,
    recentCommits: commitData.commits,
    totalCommits: commitData.total,
    firstCommitDate,
    contributorCount,
    defaultBranch,
    remoteUrl,
  };
}
