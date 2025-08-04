# GitHub Actions Release Pipeline

This repository includes a GitHub Actions workflow that automatically creates releases when you push a new tag.

## How to Release

### Method 1: Using npm scripts (Recommended)

1. **Test your changes:**
   ```bash
   npm run build
   ```

2. **Create a new release:**
   ```bash
   npm run release
   ```

   This will:
   - Build the plugin
   - Bump the patch version (1.0.0 → 1.0.1)
   - Update manifest.json and versions.json
   - Commit the changes
   - Push to GitHub
   - Create and push a new tag
   - Trigger the GitHub Actions workflow

### Method 2: Manual release

1. **Update version in package.json:**
   ```bash
   npm version patch  # or minor, major
   ```

2. **Push changes and tags:**
   ```bash
   git push
   git push --tags
   ```

### Method 3: Direct tag creation

1. **Create and push a tag directly:**
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```

## What happens during release

The GitHub Actions workflow will:

1. **Build the plugin** using Node.js 18
2. **Create a GitHub release** with:
   - Release title: "Writing Style Checker v[version]"
   - Generated release notes
   - Required files attached: `main.js`, `manifest.json`, `styles.css`
   - Draft status (you can edit and publish manually)

## File Requirements

The following files are automatically included in releases:

- `main.js` - The compiled plugin code
- `manifest.json` - Plugin metadata
- `styles.css` - Plugin styles

## Version Management

The plugin uses:
- `package.json` - npm version for development
- `manifest.json` - Obsidian plugin version (auto-synced)
- `versions.json` - Compatibility mapping (auto-updated)

## Publishing to Obsidian Community

After your release is created:

1. **Edit the draft release** on GitHub and publish it
2. **Fork the obsidian-releases repository**
3. **Add your plugin** to the community list
4. **Submit a pull request**

For detailed community plugin submission guidelines, see:
https://docs.obsidian.md/Plugins/Releasing/Submit+your+plugin
