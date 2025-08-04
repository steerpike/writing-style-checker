# Writing Style Checker

An Obsidian plugin that helps improve your writing by identifying "weasel words" and passive voice constructions - language patterns that can make your text less precise, direct, and impactful.

## Features

- **Detect Weasel Words**: Automatically finds weak words like "very", "quite", "fairly", "several", etc.
- **Identify Passive Voice**: Detects passive voice constructions using comprehensive irregular verb patterns
- **Visual Results**: Shows found issues in context with color-coded highlighting
- **Customizable**: Configure which issues to detect and how they're displayed
- **Line Numbers**: Optional line number display for easy navigation
- **Multiple Access Methods**: Use via ribbon icon, command palette, or keyboard shortcuts

## Usage

### Checking Your Document

1. **Ribbon Icon**: Click the view icon in the left ribbon
2. **Command Palette**: Use "Check writing style" or "Check current document for weasel words"
3. **Keyboard**: Assign a hotkey to the commands in Obsidian settings

### Understanding Results

The plugin will show:

- Number of issues found (weasel words and/or passive voice)
- Each issue in its surrounding context
- Line numbers (if enabled)
- Color-coded highlighting (different colors for each issue type)

### Common Issues Detected

**Weasel Words:**

- **Intensifiers**: very, quite, extremely, remarkably
- **Vague quantities**: many, various, several, few, huge, tiny
- **Hedging words**: fairly, mostly, largely, relatively
- **Unclear qualifiers**: excellent, interesting, significant, substantial

**Passive Voice:**

- Forms of "to be" + past participles
- Examples: "was written", "were made", "being analyzed", "has been completed"
- Includes comprehensive list of irregular past participles

## Configuration

Access settings through **Settings → Plugin Options → Writing Style Checker**:

- **Weasel Words Pattern**: Customize the regular expression pattern for detection
- **Weasel Words Highlight Color**: Change the color for weasel word highlighting
- **Passive Voice Highlight Color**: Change the color for passive voice highlighting
- **Check Passive Voice**: Toggle passive voice detection on/off
- **Show Line Numbers**: Toggle line number display in results
- **Reset to Defaults**: Restore original settings

## Tips for Better Writing

**When the plugin finds weasel words:**

1. **Remove unnecessary intensifiers**: "very good" → "excellent"
2. **Use specific numbers**: "several people" → "twelve people"
3. **Be more precise**: "quite big" → "doubled in size"
4. **Strengthen statements**: "relatively important" → "crucial"

**When the plugin finds passive voice:**

1. **Make the subject active**: "The report was written by the team" → "The team wrote the report"
2. **Take responsibility**: "Mistakes were made" → "We made mistakes"
3. **Be direct**: "Decisions are being made" → "The board is making decisions"
4. **Show who does what**: "The data will be analyzed" → "Our team will analyze the data"

## Installation

1. Copy the plugin files to your vault's `.obsidian/plugins/writing-style-checker/` directory
2. Reload Obsidian or enable the plugin in settings
3. Start checking your writing!

## Development

This plugin is based on the excellent bash scripts created by **Matt Might** for detecting writing issues:

**Original Source**: [Shell scripts for passive voice, weasel words, and duplicates](https://matt.might.net/articles/shell-scripts-for-passive-voice-weasel-words-duplicates/)

The plugin combines functionality from two of Matt Might's bash scripts:

1. **Weasel word detection** - Using pattern matching to find weak language that makes writing vague
2. **Passive voice detection** - Using comprehensive irregular verb patterns to identify passive constructions

## Contributing

Feel free to suggest improvements or report issues. Both the weasel words pattern and passive voice detection can be customized to fit different writing styles and requirements.
