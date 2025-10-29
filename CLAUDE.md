# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Task Consolidator is a CLI tool that consolidates notifications and tasks from multiple sources (GitHub, Slack, etc.) and integrates them into task management systems like Things 3. Built with TypeScript/Node.js with future plans to expand into a native Mac desktop application.

## Technology Stack

- **Runtime**: Node.js with TypeScript
- **CLI Framework**: Commander.js
- **GitHub API**: @octokit/rest
- **Things 3 Integration**: macOS URL scheme (`things:///`)
- **Configuration**: dotenv for environment variables

## Development Commands

```bash
# Install dependencies
npm install

# Build the project (compiles TypeScript to dist/)
npm run build

# Run in development mode (no build required)
npm run dev fetch --help

# Run the CLI after building
npm start

# Link CLI globally for local testing
npm link
task-consolidator fetch --help
```

## CLI Usage

```bash
# Fetch GitHub notifications and issues
task-consolidator fetch

# Export to JSON file
task-consolidator fetch --format json --output tasks.json

# Export to Markdown file
task-consolidator fetch --format markdown --output tasks.md

# Add tasks directly to Things 3
task-consolidator fetch --things

# Specify GitHub org and username
task-consolidator fetch --org myorg --username myuser --things
```

## Configuration

### Authentication

The tool supports two authentication methods (checked in this order):

1. **GitHub CLI (Recommended)**: Automatically uses credentials from `gh` CLI if installed and authenticated
   - Run `gh auth login` to authenticate
   - Username is automatically detected via `gh api user`
   - No manual token management required

2. **Environment Variables**: Create a `.env` file based on `.env.example`:
   ```bash
   GITHUB_TOKEN=your_github_personal_access_token
   GITHUB_ORG=your_organization_name (optional)
   GITHUB_USERNAME=your_github_username (optional)
   ```

The configuration loading logic is in `src/utils/config.ts`:
- Checks for `GITHUB_TOKEN` env var first
- If not found, checks if `gh` CLI is installed and authenticated
- Extracts token using `gh auth token`
- Auto-detects username using `gh api user --jq .login`
- Provides clear error messages prompting user to authenticate

Token requirements (either method):
- `notifications` scope - to read notifications
- `repo` scope - to read issues and repositories

## Architecture

### Directory Structure

```
src/
├── commands/          # CLI command implementations
│   └── fetch.ts      # Fetch command for GitHub tasks
├── integrations/     # External service integrations
│   ├── github.ts    # GitHub API integration
│   └── things.ts    # Things 3 URL scheme integration
├── types/           # TypeScript type definitions
│   └── index.ts    # Shared types (UnifiedTask, etc.)
├── utils/          # Utility functions
│   ├── config.ts  # Configuration loading
│   └── formatter.ts # Output formatting (JSON, Markdown)
└── index.ts       # CLI entry point
```

### Key Concepts

**UnifiedTask Format**: All tasks from different sources (GitHub, Slack, etc.) are converted to a unified `UnifiedTask` interface before export or integration with Things 3. This abstraction allows the tool to handle tasks from multiple sources consistently.

**Integration Pattern**: Each external service has its own integration class in `src/integrations/`:
- Handles authentication and API communication
- Provides methods to fetch data in service-specific formats
- Converts service-specific data to `UnifiedTask` format

**Output Flexibility**: Tasks can be:
1. Exported to JSON or Markdown files
2. Added directly to Things 3 via URL scheme
3. Both exported and added to Things 3 simultaneously

### GitHub Integration

The `GitHubIntegration` class (`src/integrations/github.ts`) provides:
- `getNotifications()` - Fetch GitHub notifications
- `getAssignedIssues()` - Fetch issues assigned to a user
- `getOrgIssues()` - Fetch issues from an organization
- `convertToUnifiedTasks()` - Convert GitHub data to unified format

### Things 3 Integration

The `ThingsIntegration` class (`src/integrations/things.ts`) uses the Things URL scheme to add tasks. It formats task data into the URL parameters and uses macOS `open` command to trigger the Things app.

**Note**: Things 3 integration only works on macOS with Things 3 installed.

## Future Expansion

The codebase is structured to support:
1. Additional source integrations (Slack, Linear, Jira, etc.) by adding new classes to `src/integrations/`
2. Expansion to Electron-based desktop app (TypeScript/Node.js foundation is compatible)
3. Additional output destinations beyond Things 3
