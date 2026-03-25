import { Command } from 'commander';
import path from 'node:path';
import { VERSION, DEFAULT_FORMAT, DEFAULT_THEME, DEFAULT_OUTPUT, DEFAULT_WIDTH, DEFAULT_HEIGHT } from './constants.js';
import { isGitRepo } from './utils/git.js';
import { runCollectors } from './collectors/index.js';
import { normalize } from './normalizer.js';
import { renderCard } from './renderer.js';
import { takeScreenshot } from './screenshot.js';
import { logger } from './utils/logger.js';
import type { CLIOptions } from './types.js';

const program = new Command();

program
  .name('gitsnap')
  .description('Generate beautiful visual snapshot cards of git repositories')
  .version(VERSION)
  .argument('[repo-path]', 'Path to the git repository', '.')
  .option('-f, --format <format>', 'Output format: png, pdf, svg', DEFAULT_FORMAT)
  .option('-o, --output <path>', 'Output filename without extension', DEFAULT_OUTPUT)
  .option('-t, --theme <theme>', 'Card theme: dark, light', DEFAULT_THEME)
  .option('--no-github', 'Skip GitHub API calls')
  .option('--width <pixels>', 'Card width in pixels', String(DEFAULT_WIDTH))
  .option('--height <pixels>', 'Card height in pixels', String(DEFAULT_HEIGHT))
  .option('--token <token>', 'GitHub personal access token')
  .action(async (repoPathArg: string, opts) => {
    const repoPath = path.resolve(repoPathArg);
    const token = opts.token ?? process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;

    const options: CLIOptions = {
      repoPath,
      format: opts.format as CLIOptions['format'],
      output: opts.output,
      theme: opts.theme as CLIOptions['theme'],
      noGithub: !opts.github,
      width: parseInt(opts.width, 10),
      height: parseInt(opts.height, 10),
      token,
    };

    // Validate
    if (!['png', 'pdf', 'svg'].includes(options.format)) {
      logger.error(`Invalid format "${options.format}". Use: png, pdf, svg`);
      process.exit(1);
    }
    if (!['dark', 'light'].includes(options.theme)) {
      logger.error(`Invalid theme "${options.theme}". Use: dark, light`);
      process.exit(1);
    }

    // Check git repo
    logger.start('Checking repository...');
    const valid = await isGitRepo(repoPath);
    if (!valid) {
      logger.fail();
      logger.error(`Not a git repository: ${repoPath}`);
      logger.info('Run "git init" to initialize a repository, or provide a valid path.');
      process.exit(1);
    }

    // Collect data
    logger.succeed('Repository found');
    logger.start(options.noGithub ? 'Scanning repository...' : 'Scanning repository and fetching GitHub data...');

    let collectorResults;
    try {
      collectorResults = await runCollectors(repoPath, {
        noGithub: options.noGithub,
        token,
      });
    } catch (err) {
      logger.fail('Failed to scan repository');
      logger.error(String(err));
      process.exit(1);
    }

    logger.succeed('Data collected');

    // Normalize
    const snapshot = normalize(collectorResults, repoPath, options.theme);

    // Render
    logger.start('Rendering card...');
    let html: string;
    try {
      html = await renderCard(snapshot);
    } catch (err) {
      logger.fail('Failed to render card');
      logger.error(String(err));
      process.exit(1);
    }
    logger.succeed('Card rendered');

    // Screenshot
    logger.start(`Generating ${options.format.toUpperCase()}...`);
    let outputPath: string;
    try {
      outputPath = await takeScreenshot(html, options);
    } catch (err) {
      logger.fail('Failed to generate image');
      const msg = String(err);
      if (msg.includes('Chrome') || msg.includes('Chromium') || msg.includes('browser')) {
        logger.error('Could not launch Chrome. Ensure puppeteer is installed correctly.');
        logger.info('Try: npx puppeteer browsers install chrome');
      } else {
        logger.error(msg);
      }
      process.exit(1);
    }

    logger.succeed(`Saved to ${outputPath}`);
  });

program.parseAsync(process.argv).catch((err) => {
  logger.error(String(err));
  process.exit(1);
});
