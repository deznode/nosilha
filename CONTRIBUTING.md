# Contributing to Nos Ilha

Thank you for your interest in contributing to Nos Ilha! This community-driven cultural heritage hub for Brava Island, Cape Verde thrives on contributions from people around the world. Whether you're fixing a bug, adding a feature, improving documentation, or contributing cultural content, your help is valued.

## Table of Contents

- [Ways to Contribute](#ways-to-contribute)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Community Guidelines](#community-guidelines)

## Ways to Contribute

There are many ways to contribute to Nos Ilha:

- **Code**: Fix bugs, add features, improve performance
- **Documentation**: Improve README, API docs, or inline comments
- **Cultural Content**: Help verify historical accuracy, contribute stories, or translate content
- **Design**: Improve UI/UX, accessibility, or visual design
- **Testing**: Write tests, report bugs, or help with QA
- **Translation**: Help translate the platform into Portuguese, French, or other languages

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/nosilha.git
   cd nosilha
   ```
3. **Set up the development environment** by following the [Getting Started](README.md#getting-started) section in the README
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Branch Naming

Use descriptive branch names with prefixes:

- `feature/` - New features (e.g., `feature/add-map-filters`)
- `fix/` - Bug fixes (e.g., `fix/login-redirect-issue`)
- `docs/` - Documentation changes (e.g., `docs/update-api-reference`)
- `refactor/` - Code refactoring (e.g., `refactor/extract-auth-hook`)

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring without feature changes
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(directory): add search filters for business categories
fix(auth): resolve JWT token refresh loop
docs(api): update endpoint documentation for v2
```

### Running Tests

Before submitting a PR, ensure all tests pass:

**Frontend:**
```bash
cd apps/web
pnpm run lint          # ESLint
npx tsc --noEmit       # TypeScript check
pnpm run test:unit     # Unit tests (local only)
```

**Backend:**
```bash
cd apps/api
./gradlew ktlintCheck  # Kotlin style
./gradlew test         # All tests
```

## Pull Request Process

1. **Update your branch** with the latest changes from `main`:
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Push your changes** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Open a Pull Request** on GitHub with:
   - A clear title describing the change
   - A description explaining what and why
   - Reference to any related issues (e.g., "Closes #123")

4. **Respond to feedback** - maintainers may request changes

5. **Once approved**, your PR will be merged

### PR Requirements

- All CI checks must pass
- Code follows project style guidelines
- New features include appropriate tests
- Documentation is updated if needed

## Coding Standards

### Frontend (TypeScript/React)

- Follow the patterns in [`docs/10-product/design-system.md`](docs/10-product/design-system.md)
- Use TypeScript strict mode
- Prefer React Server Components when possible
- Follow mobile-first responsive design

### Backend (Kotlin/Spring Boot)

- Follow the patterns in [`docs/20-architecture/api-coding-standards.md`](docs/20-architecture/api-coding-standards.md)
- Use ktlint for code formatting
- Follow Spring Modulith boundaries
- Write tests for new functionality

## Reporting Bugs

Found a bug? Help us fix it by opening an issue:

1. **Search existing issues** to avoid duplicates
2. **Create a new issue** with:
   - Clear, descriptive title
   - Steps to reproduce the bug
   - Expected vs actual behavior
   - Screenshots if applicable
   - Browser/device information

Use the **Bug Report** issue template when available.

## Suggesting Features

Have an idea for a new feature?

1. **Start a discussion** in [GitHub Discussions](../../discussions) to gauge interest
2. **Describe the problem** you're trying to solve
3. **Propose a solution** with details on how it would work
4. **Consider the scope** - smaller, focused features are easier to implement

Once discussed and agreed upon, you can create a feature request issue.

## Community Guidelines

We are committed to providing a welcoming and inclusive environment for everyone. When participating in this project:

- **Be respectful** - Treat everyone with respect and kindness
- **Be constructive** - Provide helpful feedback and suggestions
- **Be patient** - Remember that maintainers are volunteers
- **Be inclusive** - Welcome newcomers and help them get started
- **Celebrate Brava** - Honor the cultural heritage this project serves

### Cultural Sensitivity

This project preserves and celebrates the cultural heritage of Brava Island. When contributing cultural content:

- Verify historical accuracy with reliable sources
- Respect local traditions and customs
- Consult [`docs/10-product/cultural-heritage-verification.md`](docs/10-product/cultural-heritage-verification.md) for content guidelines
- When in doubt, ask the community for guidance

## Questions?

- Open a [GitHub Discussion](../../discussions) for general questions
- Check the [README](README.md) for project setup
- Review the [docs/](docs/) folder for detailed documentation

Thank you for contributing to Nos Ilha!
