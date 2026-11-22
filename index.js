
import 'dotenv/config';
import Groq from 'groq-sdk';
import readlineSync from 'readline-sync';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const asyncExecute = promisify(exec);

if (!process.env.GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY missing in .env file');
    process.exit(1);
}

const ai = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Groq model with tool-calling support
const MODEL = 'openai/gpt-oss-120b';
const MAX_STEPS = 25;

const history = [];

const instructions = `
You are an expert AI Website Builder Agent.

Create complete, attractive, interactive websites using
HTML, CSS, and vanilla JavaScript.

MANDATORY WORKFLOW:
1. Understand the user's request.
2. Create one project folder using executeCommand.
3. Create exactly three files:
   index.html, style.css, script.js.
4. Use writeFile separately for each file.
5. Each file must contain complete, working code.
6. Link CSS and JavaScript correctly in index.html.
7. Create responsive layouts for desktop and mobile.
8. Implement working buttons and interactions.
9. Never create empty files or placeholders.
10. Never use echo, type, touch or cat to write source code.
11. Verify the three files using checkFiles.
12. Fix missing files and verify again before reporting success.

For birthday websites, create a magical celebration experience:
animated balloons, confetti, glowing headings, an interactive
gift box, a birthday letter with typing animation, smooth
transitions, and a responsive photo gallery.

Use only HTML, CSS and vanilla JavaScript.
Do not require a paid API or API key in the generated website.

Use relative paths from the current working directory.
Never claim completion before verifying the files.
`;

// =====================================================
// TOOL 1: Execute terminal command
// =====================================================

async function executeCommand({ command }) {
    try {
        const { stdout, stderr } = await asyncExecute(command, {
            timeout: 30000,
            windowsHide: true,
            maxBuffer: 1024 * 1024
        });

        return JSON.stringify({
            success: true,
            stdout,
            stderr
        });
    } catch (error) {
        return JSON.stringify({
            success: false,
            error: error.message,
            stderr: error.stderr || ''
        });
    }
}

// =====================================================
// TOOL 2: Create or update a file
// =====================================================

async function writeFile({ filePath, content }) {
    try {
        const absolutePath = path.resolve(filePath);
        const root = path.resolve(process.cwd());

        if (
            !absolutePath.startsWith(root + path.sep)
        ) {
            return 'Error: File must be inside the current directory.';
        }

        fs.mkdirSync(path.dirname(absolutePath), {
            recursive: true
        });

        fs.writeFileSync(absolutePath, content, 'utf8');

        return `Success: ${filePath} created/updated.`;
    } catch (error) {
        return `Error writing file: ${error.message}`;
    }
}

// =====================================================
// TOOL 3: Verify website files
// =====================================================

async function checkFiles({ projectFolder }) {
    try {
        const folder = path.resolve(projectFolder);

        const required = [
            'index.html',
            'style.css',
            'script.js'
        ];

        const missing = required.filter(file => {
            const fullPath = path.resolve(folder, file);

            return (
                !fullPath.startsWith(folder + path.sep) ||
                !fs.existsSync(fullPath) ||
                !fs.statSync(fullPath).isFile() ||
                fs.statSync(fullPath).size === 0
            );
        });

        if (missing.length === 0) {
            return 'Success: All three files exist and are non-empty.';
        }

        return `Missing or empty files: ${missing.join(', ')}`;
    } catch (error) {
        return `Error checking files: ${error.message}`;
    }
}

// =====================================================
// TOOL DEFINITIONS
// =====================================================

const tools = [
    {
        type: 'function',
        function: {
            name: 'executeCommand',
            description:
                'Execute a terminal command for project setup.',
            parameters: {
                type: 'object',
                properties: {
                    command: {
                        type: 'string',
                        description:
                            'A terminal command, such as mkdir birthday-wishing-website'
                    }
                },
                required: ['command']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'writeFile',
            description:
                'Write complete HTML, CSS or JavaScript code to a file.',
            parameters: {
                type: 'object',
                properties: {
                    filePath: {
                        type: 'string',
                        description:
                            'Relative file path, such as birthday-wishing-website/index.html'
                    },
                    content: {
                        type: 'string',
                        description: 'Complete source code'
                    }
                },
                required: ['filePath', 'content']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'checkFiles',
            description:
                'Check that all three required website files exist and are non-empty.',
            parameters: {
                type: 'object',
                properties: {
                    projectFolder: {
                        type: 'string',
                        description: 'Project folder path'
                    }
                },
                required: ['projectFolder']
            }
        }
    }
];

const availableTools = {
    executeCommand,
    writeFile,
    checkFiles
};

// =====================================================
// RUN AGENT
// =====================================================

async function runAgent(userPrompt) {
    history.push({
        role: 'user',
        content: userPrompt
    });

    for (let step = 0; step < MAX_STEPS; step++) {
        try {
            const response = await ai.chat.completions.create({
                model: MODEL,
                messages: [
                    { role: 'system', content: instructions },
                    ...history
                ],
                tools,
                tool_choice: 'auto',
                max_completion_tokens: 12000
            });

            const message = response.choices[0]?.message;

            if (!message) {
                console.log('❌ No response from the model.');
                return;
            }

            history.push(message);

            const calls = message.tool_calls || [];

            if (calls.length === 0) {
                console.log('\n🤖 Agent:', message.content || 'Task completed.');
                return;
            }

            for (const call of calls) {
                const name = call.function.name;

                console.log(`\n🔧 Executing Tool: ${name}`);

                let result;

                try {
                    const args = JSON.parse(call.function.arguments);
                    const tool = availableTools[name];

                    if (!tool) {
                        result = `Error: Unknown tool ${name}`;
                    } else if (name === 'executeCommand') {
                        console.log('💻 Command:', args.command);

                        const approved = readlineSync.keyInYN(
                            'Allow this terminal command?'
                        );

                        result = approved
                            ? await tool(args)
                            : 'Command cancelled by user.';
                    } else {
                        result = await tool(args);
                    }
                } catch (error) {
                    result = `Tool error: ${error.message}`;
                }

                console.log('Result:', result);

                history.push({
                    role: 'tool',
                    tool_call_id: call.id,
                    content: String(result)
                });
            }
        } catch (error) {
            console.error(
                '\n❌ Groq API Error:',
                error.message || error
            );

            if (error.status === 401) {
                console.log('Check your GROQ_API_KEY in .env.');
            } else if (error.status === 429) {
                console.log(
                    'Free-tier rate limit reached. Wait and retry.'
                );
            }

            return;
        }
    }

    console.log('⚠️ Maximum steps reached. Check your files.');
}

// =====================================================
// MAIN
// =====================================================

async function main() {
    console.log('\n🚀 Free-Tier AI Website Builder Active!');
    console.log(`🤖 Model: ${MODEL}`);
    console.log('Type exit to quit.\n');

    while (true) {
        const prompt = readlineSync.question('Ask me anything--> ');

        if (!prompt.trim()) continue;

        if (prompt.trim().toLowerCase() === 'exit') {
            console.log('👋 Goodbye!');
            break;
        }

        await runAgent(prompt);
    }
}

main();
