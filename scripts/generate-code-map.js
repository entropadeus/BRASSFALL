#!/usr/bin/env node
/**
 * CODE MAP GENERATOR
 * Scans index.html and generates a structured map of all code symbols
 * Run: node scripts/generate-code-map.js
 */

const fs = require('fs');
const path = require('path');

const TARGET_FILE = path.join(__dirname, '..', 'index.html');
const OUTPUT_FILE = path.join(__dirname, '..', 'CODE_MAP.md');

// Patterns to match
const patterns = {
    classDecl: /^\s*class\s+(\w+)/,
    funcDecl: /^\s*function\s+(\w+)\s*\(/,
    constObj: /^\s*const\s+(\w+)\s*=\s*\{/,
    constArrow: /^\s*const\s+(\w+)\s*=\s*\([^)]*\)\s*=>/,
    sectionComment: /^\s*\/\/\s*[=\-]{3,}\s*(.+?)\s*[=\-]{3,}/,
    blockSectionComment: /^\s*\/\*\s*[=\-]{3,}\s*(.+?)\s*[=\-]{3,}\s*\*\//,
};

function countBraces(line) {
    let open = 0, close = 0;
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < line.length; i++) {
        const c = line[i];
        const prev = i > 0 ? line[i-1] : '';

        // Handle strings
        if ((c === '"' || c === "'" || c === '`') && prev !== '\\') {
            if (!inString) {
                inString = true;
                stringChar = c;
            } else if (c === stringChar) {
                inString = false;
            }
            continue;
        }

        if (!inString) {
            if (c === '{') open++;
            if (c === '}') close++;
        }
    }
    return { open, close };
}

function findEndOfBlock(lines, startIdx, initialDepth) {
    let depth = initialDepth;

    for (let i = startIdx; i < lines.length; i++) {
        const { open, close } = countBraces(lines[i]);
        depth += open - close;

        if (depth <= initialDepth && (open > 0 || close > 0)) {
            // Check if we closed our block
            if (i > startIdx || close > 0) {
                return i + 1;
            }
        }
    }
    return startIdx + 1;
}

function generateCodeMap() {
    if (!fs.existsSync(TARGET_FILE)) {
        console.error(`File not found: ${TARGET_FILE}`);
        process.exit(1);
    }

    const content = fs.readFileSync(TARGET_FILE, 'utf-8');
    const lines = content.split('\n');

    const symbols = {
        classes: [],
        functions: [],
        constants: [],
        shaders: [],
        sections: []
    };

    let currentSection = 'Global';
    let braceDepth = 0;
    let inScript = false;
    let scriptBaseDepth = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNum = i + 1;

        // Track script tags
        if (line.includes('<script')) {
            inScript = true;
            scriptBaseDepth = braceDepth;
        }
        if (line.includes('</script>')) {
            inScript = false;
        }

        // Count braces for depth tracking
        const { open, close } = countBraces(line);
        const depthBeforeLine = braceDepth;

        // Only match symbols at script-level depth (0 = truly top-level)
        const relativeDepth = braceDepth - scriptBaseDepth;
        const isTopLevel = inScript && relativeDepth === 0;

        if (isTopLevel) {
            // Check for section comments
            let sectionMatch = line.match(patterns.sectionComment) || line.match(patterns.blockSectionComment);
            if (sectionMatch) {
                currentSection = sectionMatch[1].trim();
                symbols.sections.push({ name: currentSection, line: lineNum });
            }

            // Check for class declarations
            let match = line.match(patterns.classDecl);
            if (match) {
                const endLine = findEndOfBlock(lines, i, braceDepth);
                symbols.classes.push({
                    name: match[1],
                    start: lineNum,
                    end: endLine,
                    section: currentSection
                });
            }

            // Check for function declarations
            if (!match) {
                match = line.match(patterns.funcDecl);
                if (match) {
                    const endLine = findEndOfBlock(lines, i, braceDepth);
                    symbols.functions.push({
                        name: match[1],
                        start: lineNum,
                        end: endLine,
                        section: currentSection
                    });
                }
            }

            // Check for const objects
            if (!match) {
                match = line.match(patterns.constObj);
                if (match) {
                    const name = match[1];
                    const endLine = findEndOfBlock(lines, i, braceDepth);

                    if (name.toLowerCase().includes('shader')) {
                        symbols.shaders.push({
                            name: name,
                            start: lineNum,
                            end: endLine,
                            section: currentSection
                        });
                    } else {
                        symbols.constants.push({
                            name: name,
                            start: lineNum,
                            end: endLine,
                            section: currentSection
                        });
                    }
                }
            }

            // Check for const arrow functions
            if (!match) {
                match = line.match(patterns.constArrow);
                if (match) {
                    const endLine = findEndOfBlock(lines, i, braceDepth);
                    symbols.functions.push({
                        name: match[1],
                        start: lineNum,
                        end: endLine,
                        section: currentSection,
                        isArrow: true
                    });
                }
            }
        }

        // Update brace depth after processing line
        braceDepth += open - close;
    }

    // Generate markdown output
    let output = `# CODE MAP - index.html
> Auto-generated by \`node scripts/generate-code-map.js\`
> Last updated: ${new Date().toISOString().split('T')[0]}
> Total lines: ${lines.length.toLocaleString()}

## Quick Jump

| Symbol | Line | Type |
|--------|------|------|
`;

    // Add quick reference table
    const allSymbols = [
        ...symbols.classes.map(s => ({ ...s, type: 'class' })),
        ...symbols.functions.map(s => ({ ...s, type: 'func' })),
        ...symbols.constants.map(s => ({ ...s, type: 'const' })),
        ...symbols.shaders.map(s => ({ ...s, type: 'shader' }))
    ].sort((a, b) => a.start - b.start);

    for (const sym of allSymbols) {
        output += `| \`${sym.name}\` | ${sym.start}-${sym.end} | ${sym.type} |\n`;
    }

    // Classes section
    if (symbols.classes.length > 0) {
        output += `\n## Classes (${symbols.classes.length})\n\n`;
        for (const cls of symbols.classes) {
            output += `- **${cls.name}** → lines ${cls.start}-${cls.end}\n`;
        }
    }

    // Group functions by section
    output += `\n## Functions (${symbols.functions.length})\n\n`;
    const funcsBySection = {};
    for (const fn of symbols.functions) {
        if (!funcsBySection[fn.section]) funcsBySection[fn.section] = [];
        funcsBySection[fn.section].push(fn);
    }
    for (const [section, funcs] of Object.entries(funcsBySection)) {
        if (funcs.length > 0) {
            output += `### ${section}\n`;
            for (const fn of funcs) {
                output += `- \`${fn.name}()\` → ${fn.start}-${fn.end}\n`;
            }
            output += '\n';
        }
    }

    // Shaders section
    if (symbols.shaders.length > 0) {
        output += `## Shaders (${symbols.shaders.length})\n\n`;
        for (const shader of symbols.shaders) {
            output += `- **${shader.name}** → lines ${shader.start}-${shader.end}\n`;
        }
    }

    // Constants/Config section
    if (symbols.constants.length > 0) {
        output += `\n## Constants & Config (${symbols.constants.length})\n\n`;
        for (const c of symbols.constants) {
            output += `- \`${c.name}\` → lines ${c.start}-${c.end}\n`;
        }
    }

    // Write output
    fs.writeFileSync(OUTPUT_FILE, output);
    console.log(`✓ Generated ${OUTPUT_FILE}`);
    console.log(`  - ${symbols.classes.length} classes`);
    console.log(`  - ${symbols.functions.length} functions`);
    console.log(`  - ${symbols.shaders.length} shaders`);
    console.log(`  - ${symbols.constants.length} constants`);
}

generateCodeMap();
