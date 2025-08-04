# Writing Style Checker

An Obsidian plugin that helps improve your writing by identifying "weasel words" - vague or weak language that makes your text less precise and impactful.

## Features

- **Detect Weasel Words**: Automatically finds weak words like "very", "quite", "fairly", "several", etc.
- **Visual Results**: Shows found words in context with highlighting
- **Customizable**: Configure which words to detect through settings
- **Line Numbers**: Optional line number display for easy navigation
- **Multiple Access Methods**: Use via ribbon icon, command palette, or keyboard shortcuts

## Usage

### Checking Your Document

1. **Ribbon Icon**: Click the search icon in the left ribbon
2. **Command Palette**: Use "Check writing style" or "Check current document for weasel words"
3. **Keyboard**: Assign a hotkey to the commands in Obsidian settings

### Understanding Results

The plugin will show:
- Number of weasel words found
- Each word in its surrounding context
- Line numbers (if enabled)
- Highlighted problematic words

### Common Weasel Words Detected

The plugin detects words like:
- **Intensifiers**: very, quite, extremely, remarkably
- **Vague quantities**: many, various, several, few, huge, tiny
- **Hedging words**: fairly, mostly, largely, relatively
- **Unclear qualifiers**: excellent, interesting, significant, substantial

## Configuration

Access settings through **Settings → Plugin Options → Writing Style Checker**:

- **Weasel Words Pattern**: Customize the regular expression pattern for detection
- **Highlight Color**: Change the color used to highlight found words
- **Show Line Numbers**: Toggle line number display in results
- **Reset to Defaults**: Restore original settings

## Tips for Better Writing

When the plugin finds weasel words, consider:

1. **Remove unnecessary intensifiers**: "very good" → "excellent"
2. **Use specific numbers**: "several people" → "twelve people"
3. **Be more precise**: "quite big" → "doubled in size"
4. **Strengthen statements**: "relatively important" → "crucial"

## Installation

1. Copy the plugin files to your vault's `.obsidian/plugins/writing-style-checker/` directory
2. Reload Obsidian or enable the plugin in settings
3. Start checking your writing!

## Development

This plugin was converted from a bash script that used `egrep` to find weasel words. The TypeScript version provides a more integrated experience within Obsidian while maintaining the same core functionality.

## Contributing

Feel free to suggest improvements or report issues. The weasel words pattern can be customized to fit different writing styles and requirements.

---

*Clean, precise writing starts with identifying the words that weaken your message.*
