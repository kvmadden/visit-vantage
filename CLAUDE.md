# Claude Code Instructions

## Deployment Process (MANDATORY for every change)

Every update must follow this exact flow:

1. **Build** — run `npx vite build` to verify no errors
2. **Version bump** — increment the version in `src/App.jsx` (`APP_VERSION` constant)
3. **Commit** — with a clear message including the version number
4. **Push** — to the working branch
5. **PR** — create a pull request to `main`
6. **Merge** — merge the PR immediately
7. **Report** — always tell the user the new version number

Never skip the PR+merge step. The site deploys from `main` via GitHub Pages.

## Version Format

- Patch: bug fixes, zoom tweaks, config changes → v2.6.1, v2.6.2
- Minor: new features, new Easter eggs, new UI → v2.7.0, v2.8.0
- Major: architecture changes → v3.0.0
