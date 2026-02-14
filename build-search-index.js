#!/usr/bin/env node
/**
 * build-search-index.js
 * Parses the 4 cheatsheet HTML files and extracts code blocks
 * into a search-index.json for the global search feature.
 *
 * Usage: node build-search-index.js
 */

const fs = require('fs');
const path = require('path');

const cheatsheets = [
    { file: 'crte-cheatsheet.html', name: 'CRTE', label: 'Active Directory' },
    { file: 'crto-cheatsheet.html', name: 'CRTO', label: 'Red Team Ops' },
    { file: 'cwp-cheatsheet.html',  name: 'CWP',  label: 'Wi-Fi Hacking' },
    { file: 'cartp-cheatsheet.html', name: 'CARTP', label: 'Azure Red Team' }
];

const index = [];

for (const cs of cheatsheets) {
    const filePath = path.join(__dirname, cs.file);
    const html = fs.readFileSync(filePath, 'utf-8');

    // Find all section blocks: <div class="section-block ..." id="...">
    const sectionRegex = /<div\s+class="section-block[^"]*"\s+id="([^"]+)"[^>]*>([\s\S]*?)(?=<div\s+class="section-block|<footer|<\/body>)/g;
    let sectionMatch;

    while ((sectionMatch = sectionRegex.exec(html)) !== null) {
        const sectionId = sectionMatch[1];
        const sectionContent = sectionMatch[2];

        // Extract section title from <h2>
        const h2Match = sectionContent.match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
        const sectionTitle = h2Match
            ? h2Match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
            : sectionId;

        // Find all code blocks within this section
        const codeBlockRegex = /<div\s+class="code-block">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;
        let codeMatch;

        while ((codeMatch = codeBlockRegex.exec(sectionContent)) !== null) {
            const block = codeMatch[1];

            // Extract language from code-header
            const langMatch = block.match(/<span\s+class="code-lang"[^>]*>([^<]+)<\/span>/);
            const lang = langMatch ? langMatch[1].trim() : '';

            // Extract code text from <pre>
            const preMatch = block.match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
            if (!preMatch) continue;

            // Strip HTML tags and decode entities
            let text = preMatch[1]
                .replace(/<[^>]+>/g, '')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/&aacute;/g, 'á')
                .replace(/&eacute;/g, 'é')
                .replace(/&iacute;/g, 'í')
                .replace(/&oacute;/g, 'ó')
                .replace(/&uacute;/g, 'ú')
                .replace(/&ntilde;/g, 'ñ')
                .replace(/\s+/g, ' ')
                .trim();

            if (!text || text.length < 3) continue;

            // Find the h3 subsection title above this code block
            const beforeCode = sectionContent.substring(0, codeMatch.index);
            const h3Matches = [...beforeCode.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/g)];
            const subsection = h3Matches.length > 0
                ? h3Matches[h3Matches.length - 1][1].replace(/<[^>]+>/g, '').trim()
                : '';

            index.push({
                cheatsheet: cs.name,
                section: subsection || sectionTitle,
                sectionId: sectionId,
                lang: lang,
                text: text.substring(0, 200),
                url: `${cs.file}#${sectionId}`
            });
        }
    }
}

const outputPath = path.join(__dirname, 'search-index.json');
fs.writeFileSync(outputPath, JSON.stringify(index, null, 0));

const jsOutputPath = path.join(__dirname, 'search-index.js');
fs.writeFileSync(jsOutputPath, 'window.__searchIndex=' + JSON.stringify(index, null, 0) + ';');

console.log(`Generated search-index.json and search-index.js with ${index.length} entries`);
