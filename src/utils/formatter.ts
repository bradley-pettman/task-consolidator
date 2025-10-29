import { UnifiedTask, OutputFormat } from '../types';

export class TaskFormatter {
  static toJSON(tasks: UnifiedTask[]): string {
    return JSON.stringify(tasks, null, 2);
  }

  static toMarkdown(tasks: UnifiedTask[]): string {
    let md = '# Tasks\n\n';

    // Group tasks by source
    const tasksBySource = tasks.reduce((acc, task) => {
      if (!acc[task.source]) {
        acc[task.source] = [];
      }
      acc[task.source].push(task);
      return acc;
    }, {} as Record<string, UnifiedTask[]>);

    for (const [source, sourceTasks] of Object.entries(tasksBySource)) {
      md += `## ${source.charAt(0).toUpperCase() + source.slice(1)}\n\n`;

      for (const task of sourceTasks) {
        md += `### ${task.title}\n\n`;

        if (task.description) {
          md += `${task.description}\n\n`;
        }

        md += `- **Type**: ${task.sourceType}\n`;
        md += `- **Created**: ${task.createdAt}\n`;
        md += `- **Updated**: ${task.updatedAt}\n`;

        if (task.url) {
          md += `- **URL**: ${task.url}\n`;
        }

        if (Object.keys(task.metadata).length > 0) {
          md += '\n**Metadata:**\n';
          for (const [key, value] of Object.entries(task.metadata)) {
            if (Array.isArray(value) && value.length > 0) {
              md += `- ${key}: ${value.join(', ')}\n`;
            } else if (value && !Array.isArray(value)) {
              md += `- ${key}: ${value}\n`;
            }
          }
        }

        md += '\n---\n\n';
      }
    }

    return md;
  }

  static format(tasks: UnifiedTask[], format: OutputFormat): string {
    switch (format) {
      case 'json':
        return this.toJSON(tasks);
      case 'markdown':
        return this.toMarkdown(tasks);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }
}
