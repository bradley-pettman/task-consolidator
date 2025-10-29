import { Octokit } from '@octokit/rest';
import chalk from 'chalk';
import { GitHubNotification, GitHubIssue, UnifiedTask } from '../types';

export class GitHubIntegration {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  async getNotifications(): Promise<GitHubNotification[]> {
    const { data } = await this.octokit.activity.listNotificationsForAuthenticatedUser({
      all: false,
      participating: false,
    });

    return data.map((notification) => {
      // Convert API URL to HTML URL
      // API: https://api.github.com/repos/owner/repo/issues/123
      // HTML: https://github.com/owner/repo/issues/123
      let htmlUrl = notification.subject.url || '';
      if (htmlUrl) {
        htmlUrl = htmlUrl
          .replace('https://api.github.com/repos/', 'https://github.com/')
          .replace('/pulls/', '/pull/');
      }

      return {
        id: notification.id,
        title: notification.subject.title,
        repository: notification.repository.full_name,
        type: notification.subject.type,
        url: htmlUrl,
        updatedAt: notification.updated_at,
        reason: notification.reason,
      };
    });
  }

  async getAssignedIssues(username: string): Promise<GitHubIssue[]> {
    const { data } = await this.octokit.issues.listForAuthenticatedUser({
      filter: 'assigned',
      state: 'open',
    });

    return data.map((issue) => ({
      id: issue.id,
      number: issue.number,
      title: issue.title,
      body: issue.body || '',
      state: issue.state,
      repository: issue.repository?.full_name || '',
      url: issue.html_url,
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
      labels: issue.labels.map((label) =>
        typeof label === 'string' ? label : label.name || ''
      ),
      assignees: issue.assignees?.map((assignee) => assignee.login) || [],
    }));
  }

  async getOrgIssues(org: string, username: string): Promise<GitHubIssue[]> {
    const { data: repos } = await this.octokit.repos.listForOrg({ org });
    const issues: GitHubIssue[] = [];

    for (const repo of repos) {
      const { data: repoIssues } = await this.octokit.issues.listForRepo({
        owner: org,
        repo: repo.name,
        assignee: username,
        state: 'open',
      });

      issues.push(
        ...repoIssues.map((issue) => ({
          id: issue.id,
          number: issue.number,
          title: issue.title,
          body: issue.body || '',
          state: issue.state,
          repository: `${org}/${repo.name}`,
          url: issue.html_url,
          createdAt: issue.created_at,
          updatedAt: issue.updated_at,
          labels: issue.labels.map((label) =>
            typeof label === 'string' ? label : label.name || ''
          ),
          assignees: issue.assignees?.map((assignee) => assignee.login) || [],
        }))
      );
    }

    return issues;
  }

  convertToUnifiedTasks(
    notifications: GitHubNotification[],
    issues: GitHubIssue[]
  ): UnifiedTask[] {
    const tasks: UnifiedTask[] = [];

    // Convert notifications
    tasks.push(
      ...notifications.map((notification) => ({
        id: notification.id,
        title: notification.title, // Just the issue/PR title
        description: `Type: ${notification.type}\nReason: ${notification.reason}`,
        source: 'github' as const,
        sourceType: 'notification',
        url: notification.url,
        createdAt: notification.updatedAt,
        updatedAt: notification.updatedAt,
        metadata: {
          repository: notification.repository,
          type: notification.type,
          reason: notification.reason,
        },
      }))
    );

    // Convert issues
    tasks.push(
      ...issues.map((issue) => ({
        id: issue.id.toString(),
        title: issue.title, // Just the issue title
        description: issue.body,
        source: 'github' as const,
        sourceType: 'issue',
        url: issue.url,
        createdAt: issue.createdAt,
        updatedAt: issue.updatedAt,
        metadata: {
          repository: issue.repository,
          number: issue.number,
          state: issue.state,
          labels: issue.labels,
          assignees: issue.assignees,
        },
      }))
    );

    return tasks;
  }

  /**
   * Mark notifications as read (keeps in inbox but marks as read)
   */
  async markNotificationsAsRead(notifications: GitHubNotification[]): Promise<void> {
    for (const notification of notifications) {
      try {
        await this.octokit.activity.markThreadAsRead({
          thread_id: parseInt(notification.id),
        });
      } catch (error) {
        console.warn(chalk.yellow(`⚠️  Failed to mark notification ${notification.id} as read:`), chalk.red(error instanceof Error ? error.message : String(error)));
      }
    }
  }

  /**
   * Mark notifications as done (removes from inbox)
   */
  async markNotificationsAsDone(notifications: GitHubNotification[]): Promise<void> {
    for (const notification of notifications) {
      try {
        await this.octokit.activity.markThreadAsDone({
          thread_id: parseInt(notification.id),
        });
      } catch (error) {
        console.warn(chalk.yellow(`⚠️  Failed to mark notification ${notification.id} as done:`), chalk.red(error instanceof Error ? error.message : String(error)));
      }
    }
  }
}
