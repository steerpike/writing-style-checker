import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';

interface WeaselMatch {
	word: string;
	line: number;
	position: number;
	context: string;
}

interface WritingStyleSettings {
	weaselWords: string;
	customWordsFile: string;
	highlightColor: string;
	showLineNumbers: boolean;
}

const DEFAULT_SETTINGS: WritingStyleSettings = {
	weaselWords: 'many|various|very|fairly|several|extremely|exceedingly|quite|remarkably|few|surprisingly|mostly|largely|huge|tiny|((are|is) a number)|excellent|interestingly|significantly|substantially|clearly|vast|relatively|completely',
	customWordsFile: '',
	highlightColor: '#ff6b6b',
	showLineNumbers: true
}

export default class WritingStyleChecker extends Plugin {
	settings: WritingStyleSettings;

	async onload() {
		await this.loadSettings();

		// Add ribbon icon
		const ribbonIconEl = this.addRibbonIcon('view', 'Check Writing Style', (evt: MouseEvent) => {
			this.checkCurrentDocument();
		});
		ribbonIconEl.addClass('writing-style-checker-ribbon');

		// Add command to check writing style
		this.addCommand({
			id: 'check-writing-style',
			name: 'Check writing style',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.checkWritingStyle(editor);
			}
		});

		// Add command to check current document
		this.addCommand({
			id: 'check-current-document',
			name: 'Check current document for weasel words',
			callback: () => {
				this.checkCurrentDocument();
			}
		});

		// Add settings tab
		this.addSettingTab(new WritingStyleSettingTab(this.app, this));
	}

	async checkCurrentDocument() {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!activeView) {
			new Notice('No active markdown document found');
			return;
		}

		const editor = activeView.editor;
		this.checkWritingStyle(editor);
	}

	async checkWritingStyle(editor: Editor) {
		const content = editor.getValue();
		const matches = this.findWeaselWords(content);

		if (matches.length === 0) {
			new Notice('No weasel words found! Your writing looks clean.');
			return;
		}

		new WeaselWordsModal(this.app, matches, this.settings).open();
	}

	findWeaselWords(content: string): WeaselMatch[] {
		const matches: WeaselMatch[] = [];
		const lines = content.split('\n');

		// Get weasel words pattern
		let weaselPattern = this.settings.weaselWords;

		// TODO: Add support for custom words file
		// if (this.settings.customWordsFile) {
		//     // Load custom words from file
		// }

		const regex = new RegExp(`\\b(${weaselPattern})\\b`, 'gi');

		lines.forEach((line, lineIndex) => {
			let match;
			while ((match = regex.exec(line)) !== null) {
				const contextStart = Math.max(0, match.index - 20);
				const contextEnd = Math.min(line.length, match.index + match[0].length + 20);
				const context = line.substring(contextStart, contextEnd);

				matches.push({
					word: match[0],
					line: lineIndex + 1,
					position: match.index,
					context: context
				});
			}
			regex.lastIndex = 0; // Reset regex for next line
		});

		return matches;
	}

	onunload() {
		// Cleanup if needed
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class WeaselWordsModal extends Modal {
	matches: WeaselMatch[];
	settings: WritingStyleSettings;

	constructor(app: App, matches: WeaselMatch[], settings: WritingStyleSettings) {
		super(app);
		this.matches = matches;
		this.settings = settings;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		// Title
		contentEl.createEl('h2', { text: 'Writing Style Check Results' });

		// Summary
		const summary = contentEl.createEl('div', { cls: 'weasel-summary' });
		summary.createEl('p', {
			text: `Found ${this.matches.length} weasel word${this.matches.length === 1 ? '' : 's'} that could weaken your writing.`
		});

		// Results container
		const resultsContainer = contentEl.createEl('div', { cls: 'weasel-results' });

		this.matches.forEach((match, index) => {
			const matchEl = resultsContainer.createEl('div', { cls: 'weasel-match' });

			// Line number (if enabled)
			if (this.settings.showLineNumbers) {
				matchEl.createEl('span', {
					text: `Line ${match.line}: `,
					cls: 'weasel-line-number'
				});
			}

			// Context with highlighted word
			const contextEl = matchEl.createEl('span', { cls: 'weasel-context' });
			const beforeWord = match.context.substring(0, match.context.toLowerCase().indexOf(match.word.toLowerCase()));
			const afterWord = match.context.substring(beforeWord.length + match.word.length);

			contextEl.appendText(beforeWord);
			const highlightEl = contextEl.createEl('span', {
				text: match.word,
				cls: 'weasel-highlight'
			});
			highlightEl.style.backgroundColor = this.settings.highlightColor;
			highlightEl.style.color = 'white';
			highlightEl.style.padding = '2px 4px';
			highlightEl.style.borderRadius = '3px';
			contextEl.appendText(afterWord);
		});

		// Close button
		const buttonContainer = contentEl.createEl('div', { cls: 'weasel-buttons' });
		const closeButton = buttonContainer.createEl('button', { text: 'Close' });
		closeButton.onclick = () => this.close();
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class WritingStyleSettingTab extends PluginSettingTab {
	plugin: WritingStyleChecker;

	constructor(app: App, plugin: WritingStyleChecker) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'Writing Style Checker Settings' });

		// Weasel words pattern
		new Setting(containerEl)
			.setName('Weasel Words Pattern')
			.setDesc('Regular expression pattern for detecting weasel words (separated by |)')
			.addTextArea(text => text
				.setPlaceholder('Enter weasel words pattern...')
				.setValue(this.plugin.settings.weaselWords)
				.onChange(async (value) => {
					this.plugin.settings.weaselWords = value;
					await this.plugin.saveSettings();
				}));

		// Custom words file (placeholder for future implementation)
		new Setting(containerEl)
			.setName('Custom Words File')
			.setDesc('Path to a custom file containing additional weasel words (one per line) - Coming soon!')
			.addText(text => text
				.setPlaceholder('Path to custom words file...')
				.setValue(this.plugin.settings.customWordsFile)
				.setDisabled(true)
				.onChange(async (value) => {
					this.plugin.settings.customWordsFile = value;
					await this.plugin.saveSettings();
				}));

		// Highlight color
		new Setting(containerEl)
			.setName('Highlight Color')
			.setDesc('Color used to highlight weasel words in results')
			.addText(text => text
				.setPlaceholder('#ff6b6b')
				.setValue(this.plugin.settings.highlightColor)
				.onChange(async (value) => {
					this.plugin.settings.highlightColor = value;
					await this.plugin.saveSettings();
				}));

		// Show line numbers
		new Setting(containerEl)
			.setName('Show Line Numbers')
			.setDesc('Display line numbers in the results')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showLineNumbers)
				.onChange(async (value) => {
					this.plugin.settings.showLineNumbers = value;
					await this.plugin.saveSettings();
				}));

		// Information section
		const infoEl = containerEl.createEl('div', { cls: 'setting-item-info' });
		infoEl.createEl('h3', { text: 'About Weasel Words' });
		infoEl.createEl('p', {
			text: 'Weasel words are terms that make your writing vague and less impactful. They include words like "very", "quite", "fairly", "several", and others that weaken your statements. This plugin helps you identify and eliminate them for clearer, more precise writing.'
		});

		// Reset to defaults
		new Setting(containerEl)
			.setName('Reset to Defaults')
			.setDesc('Reset all settings to their default values')
			.addButton(button => button
				.setButtonText('Reset')
				.onClick(async () => {
					this.plugin.settings = Object.assign({}, DEFAULT_SETTINGS);
					await this.plugin.saveSettings();
					this.display(); // Refresh the settings display
					new Notice('Settings reset to defaults');
				}));
	}
}
