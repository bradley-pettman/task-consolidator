# task-consolidator

Consolidate notifications and tasks from GitHub, Slack, and other sources directly into Things 3 or other task management systems.

A CLI tool built with TypeScript/Node.js that fetches your tasks and notifications from various sources, unifies them into a common format, and exports them to files or directly to Things 3 on macOS.

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Authenticate with GitHub** (choose one option)

   **Option 1: GitHub CLI (Recommended)**
   ```bash
   # Install GitHub CLI if you haven't already
   # macOS: brew install gh

   # Authenticate
   gh auth login
   ```

   **Option 2: Personal Access Token**
   ```bash
   cp .env.example .env
   # Edit .env and add your GitHub personal access token
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Run the CLI**
   ```bash
   # Fetch tasks and print to console
   npm run dev fetch

   # Export to a JSON file
   npm run dev fetch --format json --output tasks.json

   # Add tasks directly to Things 3
   npm run dev fetch --things
   ```

## Features

- Fetch GitHub notifications and assigned issues
- Export tasks to JSON or Markdown format
- Integrate directly with Things 3 on macOS
- Unified task format for consistent handling across sources
- Organization and user-level GitHub queries

## Configuration

### Authentication

The tool supports two authentication methods:

1. **GitHub CLI (Recommended)**: If you have `gh` CLI installed and authenticated, the tool will automatically use your credentials. No configuration needed!

2. **Environment Variables**: Create a `.env` file with:
   ```
   GITHUB_TOKEN=your_github_personal_access_token
   GITHUB_ORG=your_organization_name (optional)
   GITHUB_USERNAME=your_github_username (optional)
   ```

If using the GitHub CLI, the tool will automatically detect your username. You only need to set `GITHUB_ORG` if you want to query organization-specific issues.

## Future Plans

- Slack integration
- Additional task management integrations
- macOS desktop application
