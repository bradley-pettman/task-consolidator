import { writeFile } from 'fs/promises';
import chalk from 'chalk';
import { GitHubIntegration } from '../integrations/github';
import { ThingsIntegration } from '../integrations/things';
import { TaskFormatter } from '../utils/formatter';
import { loadConfig } from '../utils/config';
import { OutputFormat } from '../types';

interface FetchOptions {
  format: OutputFormat;
  output?: string;
  things: boolean;
  markRead: boolean;
  markDone: boolean;
  org?: string;
  username?: string;
}

export async function fetchCommand(options: FetchOptions): Promise<void> {
  try {
    const config = await loadConfig();

    // Override config with command-line options
    const org = options.org || config.github.org;
    const username = options.username || config.github.username;

    console.log(chalk.cyan('🔄 Fetching tasks from GitHub...'));

    const github = new GitHubIntegration(config.github.token);

    // Fetch notifications
    const notifications = await github.getNotifications();
    console.log(chalk.green(`✓ Found ${chalk.bold(notifications.length)} notifications`));

    // Fetch assigned issues
    let issues;
    if (org && username) {
      console.log(chalk.cyan(`🔄 Fetching issues from organization: ${chalk.bold(org)}...`));
      issues = await github.getOrgIssues(org, username);
    } else if (username) {
      console.log(chalk.cyan(`🔄 Fetching assigned issues for user: ${chalk.bold(username)}...`));
      issues = await github.getAssignedIssues(username);
    } else {
      console.log(chalk.cyan('🔄 Fetching assigned issues...'));
      issues = await github.getAssignedIssues('');
    }
    console.log(chalk.green(`✓ Found ${chalk.bold(issues.length)} assigned issues`));

    // Convert to unified format
    const tasks = github.convertToUnifiedTasks(notifications, issues);
    console.log(chalk.green(`✓ Consolidated ${chalk.bold(tasks.length)} total tasks`));

    // Export to file if specified
    if (options.output) {
      const formattedOutput = TaskFormatter.format(tasks, options.format);
      await writeFile(options.output, formattedOutput, 'utf-8');
      console.log(chalk.green(`✓ Exported to ${chalk.blue(options.output)}`));
    } else {
      // Print to console
      const formattedOutput = TaskFormatter.format(tasks, options.format);
      console.log('\n' + formattedOutput);
    }

    // Add to Things 3 if specified
    if (options.things) {
      console.log(chalk.cyan('🔄 Adding tasks to Things 3...'));
      const things = new ThingsIntegration();
      await things.addTasks(tasks);
      console.log(chalk.green(`✓ Added ${chalk.bold(tasks.length)} tasks to ${chalk.magenta('Things 3')}`));
    }

    // Mark notifications as read if specified
    if (options.markRead && notifications.length > 0) {
      console.log(chalk.cyan('🔄 Marking notifications as read...'));
      await github.markNotificationsAsRead(notifications);
      console.log(chalk.green(`✓ Marked ${chalk.bold(notifications.length)} notifications as read`));
    }

    // Mark notifications as done if specified
    if (options.markDone && notifications.length > 0) {
      console.log(chalk.cyan('🔄 Marking notifications as done...'));
      await github.markNotificationsAsDone(notifications);
      console.log(chalk.green(`✓ Marked ${chalk.bold(notifications.length)} notifications as done`));
    }

    console.log(chalk.green.bold('\n✅ Done!'));
  } catch (error) {
    console.error(chalk.red.bold('❌ Error:'), chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}
