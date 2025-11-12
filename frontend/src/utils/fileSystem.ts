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

// Rename file
export const renameFile = (files: Record<string, FileNode>, fileId: string, newName: string): Record<string, FileNode> => {
  if (!files[fileId]) return files

  return {
    ...files,
    [fileId]: {
      ...files[fileId],
      name: newName,
      language: files[fileId].type === 'file' ? getLanguageFromFileName(newName) : undefined,
      updatedAt: Date.now()
    }
  }
}

// Search files by name
export const searchFiles = (files: Record<string, FileNode>, query: string): FileNode[] => {
  const lowerQuery = query.toLowerCase()
  return Object.values(files).filter(file =>
    file.name.toLowerCase().includes(lowerQuery) && file.type === 'file'
  )
}

// Get file path
export const getFilePath = (files: Record<string, FileNode>, fileId: string): string => {
  const parts: string[] = []
  let current = files[fileId]

  while (current) {
    parts.unshift(current.name)
    if (current.parentId) {
      current = files[current.parentId]
    } else {
      break
    }
  }

  return parts.join('/')
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
  {
    id: 'landing-page',
    name: 'Landing Page',
    description: 'Modern landing page with hero section and features',
    icon: '🚀',
    files: [
      createFileNode('index.html', 'file', undefined, `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Product Landing Page</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <nav class="navbar">
    <div class="container">
      <div class="logo">MyProduct</div>
      <ul class="nav-links">
        <li><a href="#features">Features</a></li>
        <li><a href="#pricing">Pricing</a></li>
        <li><a href="#contact">Contact</a></li>
        <li><a href="#" class="btn-nav">Get Started</a></li>
      </ul>
    </div>
  </nav>

  <section class="hero">
    <div class="container">
      <h1>Build Amazing Products</h1>
      <p>The ultimate solution for modern businesses</p>
      <button class="btn-primary">Start Free Trial</button>
    </div>
  </section>

  <section id="features" class="features">
    <div class="container">
      <h2>Features</h2>
      <div class="feature-grid">
        <div class="feature-card">
          <div class="icon">⚡</div>
          <h3>Lightning Fast</h3>
          <p>Optimized for speed and performance</p>
        </div>
        <div class="feature-card">
          <div class="icon">🔒</div>
          <h3>Secure</h3>
          <p>Enterprise-grade security</p>
        </div>
        <div class="feature-card">
          <div class="icon">📱</div>
          <h3>Responsive</h3>
          <p>Works on all devices</p>
        </div>
      </div>
    </div>
  </section>

  <footer>
    <p>&copy; 2025 MyProduct. All rights reserved.</p>
  </footer>

  <script src="script.js"></script>
</body>
</html>`),
      createFileNode('style.css', 'file', undefined, `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  line-height: 1.6;
  color: #333;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.navbar {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #6366f1;
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 30px;
  align-items: center;
}

.nav-links a {
  text-decoration: none;
  color: #333;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: #6366f1;
}

.btn-nav {
  background: #6366f1;
  color: white !important;
  padding: 10px 20px;
  border-radius: 5px;
}

.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 120px 20px;
}

.hero h1 {
  font-size: 3.5rem;
  margin-bottom: 20px;
}

.hero p {
  font-size: 1.5rem;
  margin-bottom: 30px;
  opacity: 0.9;
}

.btn-primary {
  background: white;
  color: #667eea;
  border: none;
  padding: 15px 40px;
  font-size: 1.1rem;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.3s;
}

.btn-primary:hover {
  transform: translateY(-2px);
}

.features {
  padding: 80px 20px;
  background: #f9fafb;
}

.features h2 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 60px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
}

.feature-card {
  background: white;
  padding: 40px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

footer {
  background: #1f2937;
  color: white;
  text-align: center;
  padding: 30px;
}`),
      createFileNode('script.js', 'file', undefined, `// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Animate on scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in');
    }
  });
}, observerOptions);

document.querySelectorAll('.feature-card').forEach(card => {
  observer.observe(card);
});`),
    ],
  },
  {
    id: 'blog-layout',
    name: 'Blog Layout',
    description: 'Responsive blog layout with sidebar',
    icon: '📝',
    files: [
      createFileNode('index.html', 'file', undefined, `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Blog</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="header">
    <div class="container">
      <h1>My Blog</h1>
      <p>Thoughts, stories and ideas</p>
    </div>
  </header>

  <div class="container blog-container">
    <main class="blog-main">
      <article class="post">
        <img src="https://via.placeholder.com/800x400" alt="Post image">
        <div class="post-content">
          <div class="post-meta">
            <span>January 15, 2025</span>
            <span>5 min read</span>
          </div>
          <h2>Getting Started with Web Development</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          <a href="#" class="read-more">Read More →</a>
        </div>
      </article>

      <article class="post">
        <img src="https://via.placeholder.com/800x400" alt="Post image">
        <div class="post-content">
          <div class="post-meta">
            <span>January 10, 2025</span>
            <span>7 min read</span>
          </div>
          <h2>The Future of JavaScript</h2>
          <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          <a href="#" class="read-more">Read More →</a>
        </div>
      </article>
    </main>

    <aside class="sidebar">
      <div class="widget">
        <h3>About Me</h3>
        <p>I'm a web developer passionate about creating amazing digital experiences.</p>
      </div>

      <div class="widget">
        <h3>Categories</h3>
        <ul>
          <li><a href="#">Web Development</a></li>
          <li><a href="#">Design</a></li>
          <li><a href="#">JavaScript</a></li>
          <li><a href="#">Tutorials</a></li>
        </ul>
      </div>

      <div class="widget">
        <h3>Recent Posts</h3>
        <ul>
          <li><a href="#">Post Title One</a></li>
          <li><a href="#">Post Title Two</a></li>
          <li><a href="#">Post Title Three</a></li>
        </ul>
      </div>
    </aside>
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
  font-family: 'Georgia', serif;
  line-height: 1.8;
  color: #333;
  background: #f5f5f5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.header {
  background: #2c3e50;
  color: white;
  padding: 60px 0;
  text-align: center;
}

.header h1 {
  font-size: 3rem;
  margin-bottom: 10px;
}

.header p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.blog-container {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 40px;
  margin-top: 40px;
  margin-bottom: 40px;
}

.blog-main {
  min-width: 0;
}

.post {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.post img {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.post-content {
  padding: 30px;
}

.post-meta {
  display: flex;
  gap: 20px;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 15px;
}

.post h2 {
  font-size: 2rem;
  margin-bottom: 15px;
  color: #2c3e50;
}

.post p {
  color: #555;
  margin-bottom: 20px;
}

.read-more {
  color: #3498db;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s;
}

.read-more:hover {
  color: #2980b9;
}

.sidebar {
  min-width: 0;
}

.widget {
  background: white;
  padding: 25px;
  border-radius: 10px;
  margin-bottom: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.widget h3 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.widget ul {
  list-style: none;
}

.widget li {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.widget li:last-child {
  border-bottom: none;
}

.widget a {
  text-decoration: none;
  color: #555;
  transition: color 0.3s;
}

.widget a:hover {
  color: #3498db;
}

@media (max-width: 768px) {
  .blog-container {
    grid-template-columns: 1fr;
  }
}`),
      createFileNode('script.js', 'file', undefined, `// Add reading progress bar
const progressBar = document.createElement('div');
progressBar.style.cssText = \`
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(to right, #667eea, #764ba2);
  width: 0%;
  z-index: 1000;
  transition: width 0.3s;
\`;
document.body.appendChild(progressBar);

window.addEventListener('scroll', () => {
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100;
  progressBar.style.width = scrollPercentage + '%';
});`),
    ],
  },
  {
    id: 'todo-app',
    name: 'Todo App',
    description: 'Interactive todo application with localStorage',
    icon: '✅',
    files: [
      createFileNode('index.html', 'file', undefined, `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Todo App</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <h1>📝 My Tasks</h1>

    <div class="input-container">
      <input type="text" id="todoInput" placeholder="Add a new task..." />
      <button id="addBtn">Add</button>
    </div>

    <div class="filters">
      <button class="filter-btn active" data-filter="all">All</button>
      <button class="filter-btn" data-filter="active">Active</button>
      <button class="filter-btn" data-filter="completed">Completed</button>
    </div>

    <ul id="todoList"></ul>

    <div class="stats">
      <span id="taskCount">0 tasks left</span>
      <button id="clearCompleted">Clear Completed</button>
    </div>
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.container {
  background: white;
  border-radius: 15px;
  padding: 40px;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.input-container {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

#todoInput {
  flex: 1;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

#todoInput:focus {
  outline: none;
  border-color: #667eea;
}

button {
  padding: 15px 25px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

button:hover {
  background: #5568d3;
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: center;
}

.filter-btn {
  padding: 8px 16px;
  background: transparent;
  color: #666;
  border: 2px solid #e0e0e0;
  font-size: 14px;
}

.filter-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

#todoList {
  list-style: none;
  margin-bottom: 20px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
  background: #f9f9f9;
  transition: all 0.3s;
}

.todo-item:hover {
  background: #f0f0f0;
}

.todo-item.completed {
  opacity: 0.6;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
}

.todo-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.todo-text {
  flex: 1;
  font-size: 16px;
  color: #333;
}

.delete-btn {
  padding: 5px 10px;
  background: #ff4757;
  font-size: 14px;
}

.delete-btn:hover {
  background: #ff3838;
}

.stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 2px solid #e0e0e0;
  font-size: 14px;
  color: #666;
}

#clearCompleted {
  padding: 8px 16px;
  font-size: 14px;
  background: #ff4757;
}

#clearCompleted:hover {
  background: #ff3838;
}`),
      createFileNode('script.js', 'file', undefined, `let todos = JSON.parse(localStorage.getItem('todos')) || [];
let filter = 'all';

const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const taskCount = document.getElementById('taskCount');
const clearCompleted = document.getElementById('clearCompleted');
const filterBtns = document.querySelectorAll('.filter-btn');

// Add todo
function addTodo() {
  const text = todoInput.value.trim();
  if (!text) return;

  todos.push({
    id: Date.now(),
    text,
    completed: false
  });

  todoInput.value = '';
  saveTodos();
  renderTodos();
}

// Delete todo
function deleteTodo(id) {
  todos = todos.filter(todo => todo.id !== id);
  saveTodos();
  renderTodos();
}

// Toggle todo
function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    saveTodos();
    renderTodos();
  }
}

// Clear completed
function clearCompletedTodos() {
  todos = todos.filter(todo => !todo.completed);
  saveTodos();
  renderTodos();
}

// Save to localStorage
function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

// Render todos
function renderTodos() {
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  todoList.innerHTML = filteredTodos.map(todo => \`
    <li class="todo-item \${todo.completed ? 'completed' : ''}">
      <input
        type="checkbox"
        class="todo-checkbox"
        \${todo.completed ? 'checked' : ''}
        onchange="toggleTodo(\${todo.id})"
      />
      <span class="todo-text">\${todo.text}</span>
      <button class="delete-btn" onclick="deleteTodo(\${todo.id})">Delete</button>
    </li>
  \`).join('');

  const activeCount = todos.filter(t => !t.completed).length;
  taskCount.textContent = \`\${activeCount} task\${activeCount !== 1 ? 's' : ''} left\`;
}

// Event listeners
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') addTodo();
});

clearCompleted.addEventListener('click', clearCompletedTodos);

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filter = btn.dataset.filter;
    renderTodos();
  });
});

// Initial render
renderTodos();`),
    ],
  },
]
