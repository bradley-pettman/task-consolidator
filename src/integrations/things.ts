import { exec } from 'child_process';
import { promisify } from 'util';
import { UnifiedTask } from '../types';

const execAsync = promisify(exec);

export class ThingsIntegration {
  /**
   * Add a task to Things 3 using the URL scheme
   * Documentation: https://culturedcode.com/things/support/articles/2803573/
   */
  async addTask(task: UnifiedTask): Promise<void> {
    // Build tags list: always add 'tc', plus source-specific tags
    const tags = ['tc', task.source];
    if (task.metadata.repository) {
      // Add a simplified repo tag (e.g., "polaris-adventures" from "Marcato-Partners/polaris-adventures")
      const repoName = (task.metadata.repository as string).split('/').pop();
      if (repoName) {
        tags.push(repoName);
      }
    }

    // Manually encode parameters to avoid + signs (use %20 for spaces)
    const params = [
      `title=${encodeURIComponent(task.title)}`,
      `notes=${encodeURIComponent(this.formatNotes(task))}`,
      `tags=${encodeURIComponent(tags.join(','))}`,
      `when=today`,
    ];

    const url = `things:///add?${params.join('&')}`;

    // Use 'open' command on macOS to trigger the URL scheme
    await execAsync(`open "${url}"`);
  }

  /**
   * Add multiple tasks to Things 3
   */
  async addTasks(tasks: UnifiedTask[]): Promise<void> {
    for (const task of tasks) {
      await this.addTask(task);
      // Small delay to avoid overwhelming Things
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  private formatNotes(task: UnifiedTask): string {
    let notes = '';

    // Add repository if available
    if (task.metadata.repository) {
      notes += `📁 ${task.metadata.repository}\n`;
    }

    // Add issue/PR number if available
    if (task.metadata.number) {
      notes += `#${task.metadata.number}\n`;
    }

    notes += '\n';

    // Add URL
    if (task.url) {
      notes += `🔗 ${task.url}\n\n`;
    }

    // Add description if it exists and isn't too verbose
    if (task.description && task.description.length < 500) {
      notes += `${task.description}\n\n`;
    }

    // Add labels if available
    if (Array.isArray(task.metadata.labels) && task.metadata.labels.length > 0) {
      notes += `🏷️ ${task.metadata.labels.join(', ')}\n`;
    }

    return notes.trim();
  }
}
