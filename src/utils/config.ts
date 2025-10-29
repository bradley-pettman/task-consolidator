import dotenv from 'dotenv';
import { execSync } from 'child_process';
import chalk from 'chalk';

dotenv.config();

export interface Config {
  github: {
    token: string;
    org?: string;
    username?: string;
  };
}

/**
 * Check if gh CLI is installed
 */
function isGhCliInstalled(): boolean {
  try {
    execSync('gh --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if user is authenticated with gh CLI
 */
function isGhAuthenticated(): boolean {
  try {
    execSync('gh auth status', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get GitHub token from gh CLI
 */
function getGhToken(): string | null {
  try {
    const token = execSync('gh auth token', { encoding: 'utf-8' }).trim();
    return token || null;
  } catch {
    return null;
  }
}

/**
 * Get GitHub username from gh CLI
 */
function getGhUsername(): string | null {
  try {
    const username = execSync('gh api user --jq .login', { encoding: 'utf-8' }).trim();
    return username || null;
  } catch {
    return null;
  }
}

export async function loadConfig(): Promise<Config> {
  let githubToken: string | undefined | null = process.env.GITHUB_TOKEN;
  let githubUsername: string | undefined | null = process.env.GITHUB_USERNAME;

  // Try to get token from gh CLI first
  if (!githubToken) {
    if (!isGhCliInstalled()) {
      throw new Error(
        chalk.yellow('GitHub authentication required. Either:\n') +
        chalk.cyan('  1. Install and authenticate with GitHub CLI: ') + chalk.blue('https://cli.github.com/\n') +
        chalk.cyan('     Then run: ') + chalk.green('gh auth login\n') +
        chalk.cyan('  2. Or set ') + chalk.yellow('GITHUB_TOKEN') + chalk.cyan(' in your .env file')
      );
    }

    if (!isGhAuthenticated()) {
      throw new Error(
        chalk.yellow('Not authenticated with GitHub CLI. Please run:\n') +
        chalk.green('  gh auth login\n\n') +
        chalk.cyan('Or set ') + chalk.yellow('GITHUB_TOKEN') + chalk.cyan(' in your .env file')
      );
    }

    githubToken = getGhToken();
    if (!githubToken) {
      throw new Error(
        chalk.yellow('Failed to get token from GitHub CLI. Please run:\n') +
        chalk.green('  gh auth login\n\n') +
        chalk.cyan('Or set ') + chalk.yellow('GITHUB_TOKEN') + chalk.cyan(' in your .env file')
      );
    }

    // Also get username from gh CLI if not set
    if (!githubUsername) {
      githubUsername = getGhUsername();
    }

    console.log(chalk.green('✓ Using ') + chalk.bold.magenta('GitHub CLI') + chalk.green(' authentication'));
  }

  return {
    github: {
      token: githubToken,
      org: process.env.GITHUB_ORG,
      username: githubUsername || undefined,
    },
  };
}
