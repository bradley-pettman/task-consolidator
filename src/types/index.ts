export interface GitHubNotification {
  id: string;
  title: string;
  repository: string;
  type: string;
  url: string;
  updatedAt: string;
  reason: string;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: string;
  repository: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  labels: string[];
  assignees: string[];
}

export interface UnifiedTask {
  id: string;
  title: string;
  description?: string;
  source: 'github' | 'slack' | 'other';
  sourceType: string;
  url?: string;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
}

export type OutputFormat = 'json' | 'markdown';

export interface ExportOptions {
  format: OutputFormat;
  outputPath?: string;
}
