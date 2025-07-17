// src/server/routes/docs.js
import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set the root directory for documentation
// Use an absolute path to ensure we find the docs directory
const DOCS_ROOT = path.resolve(process.env.DOCS_DIR || path.join(__dirname, '../../docs'));

// Helper function to scan directory and build tree structure
async function buildDirectoryTree(dir, relativePath = '') {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const result = [];
  
  for (const entry of entries) {
    // Skip hidden files and directories (those starting with .)
    if (entry.name.startsWith('.')) continue;
    
    const entryPath = path.join(dir, entry.name);
    const relPath = path.join(relativePath, entry.name);
        
    if (entry.isDirectory()) {
      const children = await buildDirectoryTree(entryPath, relPath);
      if (children.length > 0) {
        result.push({
          type: 'folder',
          name: entry.name,
          path: relPath,
          children: children
        });
      }
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      // Only include markdown files
      result.push({
        type: 'file',
        name: entry.name.replace('.md', ''),
        path: relPath.replace('.md', '')
      });
    }
  }
  
  // Sort folders first, then files, both alphabetically
  return result.sort((a, b) => {
    if (a.type === b.type) {
      return a.name.localeCompare(b.name);
    }
    return a.type === 'folder' ? -1 : 1;
  });
}

// API endpoint to get the documentation tree structure
router.get('/tree', async (req, res) => {
  try {
    console.log('Looking for docs in:', DOCS_ROOT);
    
    // Check if the directory exists
    try {
      await fs.access(DOCS_ROOT);
      console.log('Docs directory exists');
    } catch (err) {
      console.error('Docs directory does not exist:', err.message);
      return res.status(500).json({ 
        error: 'Documentation directory not found',
        path: DOCS_ROOT
      });
    }
    
    const tree = await buildDirectoryTree(DOCS_ROOT);
    res.json(tree);
  } catch (error) {
    console.error('Error building directory tree:', error);
    res.status(500).json({ error: 'Failed to get documentation structure' });
  }
});

// Handle document content requests with query parameter
router.get('/content', async (req, res) => {
  try {
    const docPath = req.query.path;
    
    if (!docPath) {
      return res.status(400).json({ error: 'Please specify a document path' });
    }
    
    const fullPath = path.join(DOCS_ROOT, `${docPath}.md`);
    
    // Security check: prevent path traversal attacks
    const normalizedFullPath = path.normalize(fullPath);
    if (!normalizedFullPath.startsWith(DOCS_ROOT)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const content = await fs.readFile(fullPath, 'utf8');
    res.send(content);
  } catch (error) {
    console.error('Error reading markdown file:', error);
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'Document not found' });
    } else {
      res.status(500).json({ error: 'Failed to get document content' });
    }
  }
});

export default router;