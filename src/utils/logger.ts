import chalk from 'chalk';
import ora, { Ora } from 'ora';

let spinner: Ora | null = null;

export const logger = {
  info(msg: string) {
    console.log(chalk.blue('ℹ'), msg);
  },

  success(msg: string) {
    console.log(chalk.green('✓'), msg);
  },

  warn(msg: string) {
    console.warn(chalk.yellow('⚠'), msg);
  },

  error(msg: string) {
    console.error(chalk.red('✗'), msg);
  },

  start(msg: string) {
    spinner = ora(msg).start();
    return spinner;
  },

  succeed(msg?: string) {
    spinner?.succeed(msg);
    spinner = null;
  },

  fail(msg?: string) {
    spinner?.fail(msg);
    spinner = null;
  },

  stop() {
    spinner?.stop();
    spinner = null;
  },
};
