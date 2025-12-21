const git = require('simple-git')();
const path = require('path');

async function test() {
    const topLevel = (await git.revparse(['--show-toplevel'])).trim();
    const diffSummary = await git.diffSummary(['main']);
    console.log('Diff Summary Files:', diffSummary.files.map(f => f.file));

    for (const fileSummary of diffSummary.files) {
        const relativeFile = fileSummary.file;
        const absoluteFile = path.resolve(topLevel, relativeFile);
        console.log('\nProcessing file:', absoluteFile);

        const diffText = await git.diff(['main', '--', relativeFile]);
        console.log('Diff Text Length:', diffText.length);

        const additions = [];
        const lines = diffText.split('\n');
        let currentLine = 0;

        for (const line of lines) {
            if (line.startsWith('@@')) {
                const match = line.match(/\+(\d+)/);
                if (match) {
                    currentLine = parseInt(match[1], 10);
                    console.log('Hunk start line:', currentLine);
                }
                continue;
            }
            if (!line.startsWith('+') && !line.startsWith('-') && !line.startsWith(' ')) {
                continue;
            }
            if (line.startsWith('+') && !line.startsWith('+++')) {
                additions.push(currentLine);
                currentLine++;
            } else if (line.startsWith('-') && !line.startsWith('---')) {
                // skip
            } else {
                currentLine++;
            }
        }
        console.log('Extracted Additions:', additions);
    }
}

test().catch(console.error);
