import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';

interface WeaselMatch {
	word: string;
	line: number;
	position: number;
	context: string;
}

interface PassiveVoiceMatch {
	phrase: string;
	line: number;
	position: number;
	context: string;
	beVerb: string;
	pastParticiple: string;
}

interface WritingStyleSettings {
	weaselWords: string;
	customWordsFile: string;
	highlightColor: string;
	passiveHighlightColor: string;
	showLineNumbers: boolean;
	checkPassiveVoice: boolean;
}

const DEFAULT_SETTINGS: WritingStyleSettings = {
	weaselWords: 'many|various|very|fairly|several|extremely|exceedingly|quite|remarkably|few|surprisingly|mostly|largely|huge|tiny|((are|is) a number)|excellent|interestingly|significantly|substantially|clearly|vast|relatively|completely',
	customWordsFile: '',
	highlightColor: '#ff6b6b',
	passiveHighlightColor: '#ffa500',
	showLineNumbers: true,
	checkPassiveVoice: true
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
		const weaselMatches = this.findWeaselWords(content);
		const passiveMatches = this.settings.checkPassiveVoice ? this.findPassiveVoice(content) : [];

		if (weaselMatches.length === 0 && passiveMatches.length === 0) {
			new Notice('No writing issues found! Your writing looks clean.');
			return;
		}

		new WritingIssuesModal(this.app, weaselMatches, passiveMatches, this.settings).open();
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

	findPassiveVoice(content: string): PassiveVoiceMatch[] {
		const matches: PassiveVoiceMatch[] = [];
		const lines = content.split('\n');

		// Irregular past participles from the bash script
		const irregulars = "awoken|been|born|beat|become|begun|bent|beset|bet|bid|bidden|bound|bitten|bled|blown|broken|bred|brought|broadcast|built|burnt|burst|bought|cast|caught|chosen|clung|come|cost|crept|cut|dealt|dug|dived|done|drawn|dreamt|driven|drunk|eaten|fallen|fed|felt|fought|found|fit|fled|flung|flown|forbidden|forgotten|foregone|forgiven|forsaken|frozen|gotten|given|gone|ground|grown|hung|heard|hidden|hit|held|hurt|kept|knelt|knit|known|laid|led|leapt|learnt|left|lent|let|lain|lighted|lost|made|meant|met|misspelt|mistaken|mown|overcome|overdone|overtaken|overthrown|paid|pled|proven|put|quit|read|rid|ridden|rung|risen|run|sawn|said|seen|sought|sold|sent|set|sewn|shaken|shaven|shorn|shed|shone|shod|shot|shown|shrunk|shut|sung|sunk|sat|slept|slain|slid|slung|slit|smitten|sown|spoken|sped|spent|spilt|spun|spit|split|spread|sprung|stood|stolen|stuck|stung|stunk|stridden|struck|strung|striven|sworn|swept|swollen|swum|swung|taken|taught|torn|told|thought|thrived|thrown|thrust|trodden|understood|upheld|upset|woken|worn|woven|wed|wept|wound|won|withheld|withstood|wrung|written";

		// Pattern to match passive voice: "to be" verb + past participle
		const regex = new RegExp(`\\b(am|are|were|being|is|been|was|be)\\b[ ]*(\\w+ed|${irregulars})\\b`, 'gi');

		lines.forEach((line, lineIndex) => {
			let match;
			while ((match = regex.exec(line)) !== null) {
				const contextStart = Math.max(0, match.index - 25);
				const contextEnd = Math.min(line.length, match.index + match[0].length + 25);
				const context = line.substring(contextStart, contextEnd);

				matches.push({
					phrase: match[0],
					line: lineIndex + 1,
					position: match.index,
					context: context,
					beVerb: match[1],
					pastParticiple: match[2]
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

class WritingIssuesModal extends Modal {
	weaselMatches: WeaselMatch[];
	passiveMatches: PassiveVoiceMatch[];
	settings: WritingStyleSettings;

	constructor(app: App, weaselMatches: WeaselMatch[], passiveMatches: PassiveVoiceMatch[], settings: WritingStyleSettings) {
		super(app);
		this.weaselMatches = weaselMatches;
		this.passiveMatches = passiveMatches;
		this.settings = settings;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		// Set CSS custom properties for highlight colors
		contentEl.style.setProperty('--weasel-highlight-color', this.settings.highlightColor);
		contentEl.style.setProperty('--passive-highlight-color', this.settings.passiveHighlightColor);

		// Title
		contentEl.createEl('h2', { text: 'Writing Style Check Results' });

		// Summary
		const summary = contentEl.createEl('div', { cls: 'weasel-summary' });
		const totalIssues = this.weaselMatches.length + this.passiveMatches.length;

		let summaryText = `Found ${totalIssues} writing issue${totalIssues === 1 ? '' : 's'}`;
		if (this.weaselMatches.length > 0 && this.passiveMatches.length > 0) {
			summaryText += `: ${this.weaselMatches.length} weasel word${this.weaselMatches.length === 1 ? '' : 's'} and ${this.passiveMatches.length} passive voice instance${this.passiveMatches.length === 1 ? '' : 's'}`;
		} else if (this.weaselMatches.length > 0) {
			summaryText += `: ${this.weaselMatches.length} weasel word${this.weaselMatches.length === 1 ? '' : 's'}`;
		} else if (this.passiveMatches.length > 0) {
			summaryText += `: ${this.passiveMatches.length} passive voice instance${this.passiveMatches.length === 1 ? '' : 's'}`;
		}
		summaryText += ' that could weaken your writing.';

		summary.createEl('p', { text: summaryText });

		// Results container
		const resultsContainer = contentEl.createEl('div', { cls: 'weasel-results' });

		// Show weasel words if any
		if (this.weaselMatches.length > 0) {
			const weaselSection = resultsContainer.createEl('div', { cls: 'issue-section' });
			weaselSection.createEl('h3', { text: 'Weasel Words', cls: 'issue-section-title' });

			this.weaselMatches.forEach((match) => {
				this.renderWeaselMatch(weaselSection, match);
			});
		}

		// Show passive voice if any
		if (this.passiveMatches.length > 0) {
			const passiveSection = resultsContainer.createEl('div', { cls: 'issue-section' });
			passiveSection.createEl('h3', { text: 'Passive Voice', cls: 'issue-section-title' });

			this.passiveMatches.forEach((match) => {
				this.renderPassiveMatch(passiveSection, match);
			});
		}

		// Close button
		const buttonContainer = contentEl.createEl('div', { cls: 'weasel-buttons' });
		const closeButton = buttonContainer.createEl('button', { text: 'Close' });
		closeButton.onclick = () => this.close();
	}

	renderWeaselMatch(container: HTMLElement, match: WeaselMatch) {
		const matchEl = container.createEl('div', { cls: 'weasel-match' });

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
		contextEl.appendText(afterWord);
	}

	renderPassiveMatch(container: HTMLElement, match: PassiveVoiceMatch) {
		const matchEl = container.createEl('div', { cls: 'weasel-match' });

		// Line number (if enabled)
		if (this.settings.showLineNumbers) {
			matchEl.createEl('span', {
				text: `Line ${match.line}: `,
				cls: 'weasel-line-number'
			});
		}

		// Context with highlighted phrase
		const contextEl = matchEl.createEl('span', { cls: 'weasel-context' });
		const beforePhrase = match.context.substring(0, match.context.toLowerCase().indexOf(match.phrase.toLowerCase()));
		const afterPhrase = match.context.substring(beforePhrase.length + match.phrase.length);

		contextEl.appendText(beforePhrase);
		const highlightEl = contextEl.createEl('span', {
			text: match.phrase,
			cls: 'passive-highlight'
		});
		contextEl.appendText(afterPhrase);
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
			.setName('Weasel Words Highlight Color')
			.setDesc('Color used to highlight weasel words in results')
			.addText(text => text
				.setPlaceholder('#ff6b6b')
				.setValue(this.plugin.settings.highlightColor)
				.onChange(async (value) => {
					this.plugin.settings.highlightColor = value;
					await this.plugin.saveSettings();
				}));

		// Passive voice highlight color
		new Setting(containerEl)
			.setName('Passive Voice Highlight Color')
			.setDesc('Color used to highlight passive voice in results')
			.addText(text => text
				.setPlaceholder('#ffa500')
				.setValue(this.plugin.settings.passiveHighlightColor)
				.onChange(async (value) => {
					this.plugin.settings.passiveHighlightColor = value;
					await this.plugin.saveSettings();
				}));

		// Check passive voice toggle
		new Setting(containerEl)
			.setName('Check Passive Voice')
			.setDesc('Enable detection of passive voice constructions')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.checkPassiveVoice)
				.onChange(async (value) => {
					this.plugin.settings.checkPassiveVoice = value;
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
		infoEl.createEl('h3', { text: 'About Writing Issues' });

		const weaselInfo = infoEl.createEl('p');
		weaselInfo.createEl('strong', { text: 'Weasel words' });
		weaselInfo.appendText(' are terms that make your writing vague and less impactful. They include words like "very", "quite", "fairly", "several", and others that weaken your statements.');

		const passiveInfo = infoEl.createEl('p');
		passiveInfo.createEl('strong', { text: 'Passive voice' });
		passiveInfo.appendText(' occurs when the subject receives the action rather than performing it (e.g., "The report was written" vs. "I wrote the report"). While not always wrong, overuse can make writing less direct and engaging.');

		const generalInfo = infoEl.createEl('p');
		generalInfo.appendText('This plugin helps you identify and eliminate these issues for clearer, more precise writing.');

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
