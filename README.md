# 🤖 AI Website Builder Agent

An AI-powered website builder that uses **Groq LLM and JavaScript Tool Calling** to automatically generate complete, responsive, and interactive websites based on natural language prompts.

Instead of manually writing HTML, CSS, and JavaScript, users can simply describe the website they want, and the AI agent handles project creation, code generation, and file verification.

## ✨ Features

- **AI-Powered Website Generation:** Converts natural language prompts into complete websites.
- **Automated Project Setup:** Creates a separate project folder for each website.
- **Tool Calling:** Uses AI function calling to execute terminal commands and create files.
- **Complete Code Generation:** Generates three files:
  - `index.html`
  - `style.css`
  - `script.js`
- **Responsive Design:** Generates layouts suitable for desktop and mobile devices.
- **Interactive Websites:** Implements functional buttons, animations, and JavaScript interactions.
- **File Verification:** Checks whether all required files exist and contain code.
- **Error Handling:** Handles missing API keys, tool errors, and API rate limits.
- **Command Approval:** Asks for user permission before executing terminal commands.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| JavaScript (Node.js) | Backend and agent logic |
| Groq API | AI model integration |
| GPT-OSS 120B | Language model |
| Groq SDK | API communication |
| HTML5 | Website structure |
| CSS3 | Styling and responsive layouts |
| Vanilla JavaScript | Website interactions |
| Node.js File System | File creation and verification |
| dotenv | Environment variable management |
| readline-sync | Interactive command-line interface |

## ⚙️ How It Works

1. User enters a website description through the command-line interface.
2. The prompt is sent to the Groq LLM.
3. The AI understands the requirements and decides which tools to call.
4. The agent creates a project folder using `executeCommand`.
5. It generates complete HTML, CSS, and JavaScript code using `writeFile`.
6. The `checkFiles` tool verifies that all three files exist and are non-empty.
7. The AI reports the result to the user.

## 📁 Project Structure

```text
AI-Website-Builder-Agent/
│
├── index.js
├── write_files.js
├── package.json
├── package-lock.json
├── .gitignore
├── .env
│
└── Generated Websites/
    └── project-name/
        ├── index.html
        ├── style.css
        └── script.js
```

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Palak-06-Tiwari/AI-Website-Builder-Agent.git
```

### 2. Navigate to the Project

```bash
cd AI-Website-Builder-Agent
```

### 3. Install Dependencies

```bash
npm install
```

Required packages include:

```bash
npm install groq-sdk dotenv readline-sync
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```env
GROQ_API_KEY=your_groq_api_key
```

Get your API key from [Groq Console](https://console.groq.com/).

**Important:** Never upload your `.env` file or expose your API key on GitHub.

### 5. Run the Application

```bash
node index.js
```

## 💡 Example Usage

Start the application and enter a prompt:

```text
Ask me anything--> Create a birthday wishing website
```

The AI agent will:
- Create a birthday website project folder.
- Generate an HTML page with a birthday theme.
- Add CSS animations, balloons, and confetti.
- Implement an interactive gift box and birthday letter.
- Verify the generated files.

Other possible prompts:

- Create a college club website.
- Build a movie recommendation website.
- Create a personal portfolio website.
- Build a food delivery landing page.

## 🔧 Agent Tools

The project uses three custom tools:

| Tool | Responsibility |
|---|---|
| `executeCommand` | Executes approved terminal commands for project setup. |
| `writeFile` | Creates or updates website source files. |
| `checkFiles` | Verifies the existence and non-empty status of required files. |

The agent uses a multi-step execution loop with a maximum of 25 steps to handle tool calls and their responses.

## 🔮 Future Enhancements

- Add support for React and other frontend frameworks.
- Introduce website preview functionality.
- Support image generation and asset integration.
- Add multiple design templates.
- Enable deployment directly to hosting platforms.
- Develop a graphical user interface.

## 👩‍💻 Author

**Palak Tiwari**

B.Tech Computer Science and Engineering

GitHub: [Palak-06-Tiwari](https://github.com/Palak-06-Tiwari)

---

⭐ If you find this project interesting, consider giving it a star!
