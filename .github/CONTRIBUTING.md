# Contributing to Meta Viewer

Thank you for your interest in contributing to Meta Viewer! This document provides guidelines for contributing to the project.

## Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/vsc-meta-viewer.git
   cd vsc-meta-viewer
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

1. Make your changes
2. Run linting: `npm run lint`
3. Compile TypeScript: `npm run compile`
4. Test your changes:
   - Press F5 in VS Code to launch Extension Development Host
   - Test the extension functionality
5. Commit your changes with a descriptive message
6. Push to your fork and create a Pull Request

## Code Style

- Follow the existing code style
- Use TypeScript for all new code
- Add appropriate type annotations
- Use meaningful variable and function names
- Add comments for complex logic

## Pull Request Guidelines

- Provide a clear description of the changes
- Include screenshots for UI changes
- Ensure all tests pass
- Update documentation if needed
- Link related issues

## Reporting Issues

- Use the issue tracker to report bugs
- Provide detailed reproduction steps
- Include VS Code version and OS information
- Attach relevant logs or screenshots