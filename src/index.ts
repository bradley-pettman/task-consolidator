#!/usr/bin/env node

import { Command } from 'commander';
import { fetchCommand } from './commands/fetch';

const program = new Command();

program
  .name('task-consolidator')
  .description('Consolidate tasks from GitHub, Slack, and other sources')
  .version('1.0.0');

program
  .command('fetch')
  .description('Fetch tasks from GitHub')
  .option('-f, --format <format>', 'Output format (json|markdown)', 'json')
  .option('-o, --output <path>', 'Output file path (prints to console if not specified)')
  .option('-t, --things', 'Add tasks to Things 3', false)
  .option('-r, --mark-read', 'Mark GitHub notifications as read after fetching', false)
  .option('-d, --mark-done', 'Mark GitHub notifications as done (removes from inbox)', false)
  .option('--org <org>', 'GitHub organization')
  .option('--username <username>', 'GitHub username')
  .action(fetchCommand);

program.parse();
