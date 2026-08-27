// @ts-check

// --- Core style (frozen against upstream default drift) ---
module.exports = {
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: false,
  quoteProps: "as-needed",
  trailingComma: "all",
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: "always",
  endOfLine: "lf", // must match .gitattributes `eol=lf`

  // --- Markdown ---
  // "preserve" keeps authored line breaks, so editing one sentence touches one line.
  // "always" would reflow whole paragraphs to printWidth and make content diffs unreadable.
  proseWrap: "preserve",
  // Format fenced code blocks inside markdown with the matching parser.
  embeddedLanguageFormatting: "auto",
};
