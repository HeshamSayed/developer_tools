// File System Utilities for Code Playground

import type { FileNode, FileSystemState, Template } from '@/types/filesystem'
import { saveAs } from 'file-saver'

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Get file language from extension
export const getLanguageFromFileName = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase()
  const languageMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    html: 'html',
    htm: 'html',
    css: 'css',
    scss: 'scss',
    sass: 'sass',
    less: 'less',
    json: 'json',
    xml: 'xml',
    svg: 'svg',
    md: 'markdown',
    py: 'python',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    cs: 'csharp',
    php: 'php',
    rb: 'ruby',
    go: 'go',
    rs: 'rust',
    kt: 'kotlin',
    swift: 'swift',
    sql: 'sql',
    sh: 'bash',
    yml: 'yaml',
    yaml: 'yaml',
    txt: 'text',
  }
  return languageMap[ext || ''] || 'text'
}

// Create a new file node
export const createFileNode = (
  name: string,
  type: 'file' | 'directory',
  parentId?: string,
  content: string = ''
): FileNode => {
  const now = Date.now()
  return {
    id: generateId(),
    name,
    type,
    content: type === 'file' ? content : undefined,
    language: type === 'file' ? getLanguageFromFileName(name) : undefined,
    children: type === 'directory' ? [] : undefined,
    parentId,
    createdAt: now,
    updatedAt: now,
  }
}

// Build file tree from flat structure
export const buildFileTree = (files: Record<string, FileNode>, rootId: string): FileNode => {
  const root = files[rootId]
  if (!root || root.type !== 'directory') {
    throw new Error('Invalid root node')
  }

  const buildTree = (node: FileNode): FileNode => {
    if (node.type === 'directory') {
      const children = Object.values(files)
        .filter(file => file.parentId === node.id)
        .map(child => buildTree(child))
        .sort((a, b) => {
          // Directories first, then alphabetically
          if (a.type !== b.type) {
            return a.type === 'directory' ? -1 : 1
          }
          return a.name.localeCompare(b.name)
        })
      return { ...node, children }
    }
    return node
  }

  return buildTree(root)
}

// Flatten file tree to object
export const flattenFileTree = (tree: FileNode): Record<string, FileNode> => {
  const files: Record<string, FileNode> = {}

  const traverse = (node: FileNode) => {
    const { children, ...nodeWithoutChildren } = node
    files[node.id] = nodeWithoutChildren

    if (children) {
      children.forEach(child => traverse(child))
    }
  }

  traverse(tree)
  return files
}

// Export files as ZIP (simplified - creates downloadable text files)
export const exportAsZip = async (files: Record<string, FileNode>, rootId: string) => {
  // For now, we'll create a simple JSON export
  // In a real implementation, you'd use JSZip library
  const tree = buildFileTree(files, rootId)
  const exportData = JSON.stringify(tree, null, 2)

  const blob = new Blob([exportData], { type: 'application/json' })
  saveAs(blob, `code-playground-${Date.now()}.json`)
}

// Export individual file
export const exportFile = (file: FileNode) => {
  if (file.type !== 'file' || !file.content) return

  const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' })
  saveAs(blob, file.name)
}

// Save to localStorage
export const saveToLocalStorage = (state: FileSystemState) => {
  try {
    localStorage.setItem('code-playground-files', JSON.stringify(state))
    localStorage.setItem('code-playground-last-saved', new Date().toISOString())
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
  }
}

// Load from localStorage
export const loadFromLocalStorage = (): FileSystemState | null => {
  try {
    const data = localStorage.getItem('code-playground-files')
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Failed to load from localStorage:', error)
    return null
  }
}

// Clear localStorage
export const clearLocalStorage = () => {
  localStorage.removeItem('code-playground-files')
  localStorage.removeItem('code-playground-last-saved')
}

// Default templates
export const templates: Template[] = [
  {
    id: 'blank',
    name: 'Blank Project',
    description: 'Start with an empty project',
    icon: '📄',
    files: [
      createFileNode('index.html', 'file', undefined, `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Project</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Hello World!</h1>
  <script src="script.js"></script>
</body>
</html>`),
      createFileNode('style.css', 'file', undefined, `body {
  margin: 0;
  padding: 20px;
  font-family: system-ui, sans-serif;
  background: #f5f5f5;
}

h1 {
  color: #333;
}`),
      createFileNode('script.js', 'file', undefined, `console.log('Hello World!');

document.addEventListener('DOMContentLoaded', () => {
  console.log('Page loaded successfully!');
});`),
    ],
  },
  {
    id: 'react-starter',
    name: 'React App',
    description: 'React application starter template',
    icon: '⚛️',
    files: [
      createFileNode('index.html', 'file', undefined, `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React App</title>
</head>
<body>
  <div id="root"></div>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script type="text/babel" src="App.jsx"></script>
</body>
</html>`),
      createFileNode('App.jsx', 'file', undefined, `function App() {
  const [count, setCount] = React.useState(0);

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h1>React Counter</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);`),
    ],
  },
  {
    id: 'dashboard',
    name: 'Dashboard UI',
    description: 'Modern dashboard layout with CSS Grid',
    icon: '📊',
    files: [
      createFileNode('index.html', 'file', undefined, `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="dashboard">
    <header class="header">
      <h1>Dashboard</h1>
    </header>
    <nav class="sidebar">
      <ul>
        <li>Home</li>
        <li>Analytics</li>
        <li>Settings</li>
      </ul>
    </nav>
    <main class="content">
      <div class="card">
        <h2>Welcome</h2>
        <p>This is a dashboard template</p>
      </div>
    </main>
  </div>
  <script src="script.js"></script>
</body>
</html>`),
      createFileNode('style.css', 'file', undefined, `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, sans-serif;
}

.dashboard {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar content";
  grid-template-columns: 200px 1fr;
  grid-template-rows: 60px 1fr;
  height: 100vh;
}

.header {
  grid-area: header;
  background: #2c3e50;
  color: white;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.sidebar {
  grid-area: sidebar;
  background: #34495e;
  color: white;
  padding: 20px;
}

.sidebar ul {
  list-style: none;
}

.sidebar li {
  padding: 10px;
  cursor: pointer;
  border-radius: 4px;
}

.sidebar li:hover {
  background: rgba(255, 255, 255, 0.1);
}

.content {
  grid-area: content;
  padding: 20px;
  background: #ecf0f1;
}

.card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}`),
      createFileNode('script.js', 'file', undefined, `document.querySelectorAll('.sidebar li').forEach(item => {
  item.addEventListener('click', () => {
    console.log('Navigating to:', item.textContent);
  });
});`),
    ],
  },
  {
    id: 'portfolio',
    name: 'Portfolio Page',
    description: 'Personal portfolio template',
    icon: '💼',
    files: [
      createFileNode('index.html', 'file', undefined, `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Portfolio</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <h1>John Doe</h1>
    <p>Web Developer</p>
  </header>

  <section class="about">
    <h2>About Me</h2>
    <p>I'm a passionate web developer with expertise in modern web technologies.</p>
  </section>

  <section class="projects">
    <h2>Projects</h2>
    <div class="project-grid">
      <div class="project-card">
        <h3>Project 1</h3>
        <p>Description of project 1</p>
      </div>
      <div class="project-card">
        <h3>Project 2</h3>
        <p>Description of project 2</p>
      </div>
    </div>
  </section>

  <footer>
    <p>&copy; 2025 John Doe</p>
  </footer>

  <script src="script.js"></script>
</body>
</html>`),
      createFileNode('style.css', 'file', undefined, `body {
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
}

header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 100px 20px;
}

header h1 {
  font-size: 3rem;
  margin-bottom: 10px;
}

section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
}

h2 {
  font-size: 2rem;
  margin-bottom: 30px;
  text-align: center;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.project-card {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.project-card:hover {
  transform: translateY(-5px);
}

footer {
  background: #333;
  color: white;
  text-align: center;
  padding: 20px;
}`),
      createFileNode('script.js', 'file', undefined, `// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

// Add fade-in animation on scroll
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = 1;
      entry.target.style.transform = 'translateY(0)';
    }
  });
});

document.querySelectorAll('section').forEach(section => {
  section.style.opacity = 0;
  section.style.transform = 'translateY(20px)';
  section.style.transition = 'opacity 0.6s, transform 0.6s';
  observer.observe(section);
});`),
    ],
  },
]
