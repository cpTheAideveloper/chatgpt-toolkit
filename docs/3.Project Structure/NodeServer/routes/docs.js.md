### Overview

This code defines an Express router for a Node.js server that handles documentation files stored in Markdown format. It provides two main API endpoints:

1. **GET `/tree`**: Retrieves the directory structure of the documentation, showing folders and Markdown files.
2. **GET `/content`**: Retrieves the content of a specific Markdown document based on a provided path.

The router reads the documentation from a specified directory, builds a tree structure of folders and files, and serves the content of individual Markdown files upon request.

---

### Detailed Explanation

#### Importing Required Modules

```javascript
import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
```
- **express**: Imports the Express framework to create the router.
- **fs**: Imports the filesystem module with promise-based methods for file operations.
- **path**: Imports the path module to handle file and directory paths.
- **fileURLToPath**: Imports a function to convert file URLs to file paths.

#### Creating the Router

```javascript
const router = express.Router();
```
- **router**: Creates a new router instance using Express, which will handle the API endpoints.

#### Determining the Current Directory

```javascript
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```
- **__filename**: Converts the current module's URL to a file path.
- **__dirname**: Extracts the directory name from the file path, representing the current directory.

#### Setting the Documentation Root Directory

```javascript
const DOCS_ROOT = path.resolve(process.env.DOCS_DIR || path.join(__dirname, '../../docs'));
```
- **DOCS_ROOT**: Determines the absolute path to the documentation directory. It uses the `DOCS_DIR` environment variable if set; otherwise, it defaults to a `docs` folder two levels above the current directory.

#### Building the Directory Tree

```javascript
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
```
- **buildDirectoryTree**: An asynchronous function that scans a directory and builds a tree structure of its contents.
  - **dir**: The current directory path to scan.
  - **relativePath**: The path relative to the root documentation directory.
  - **entries**: Reads the contents of the current directory, retrieving file and directory entries.
  - **result**: An array to store the folder and file objects.
  - **for (const entry of entries)**: Iterates over each entry (file or directory) in the current directory.
    - **if (entry.name.startsWith('.')) continue;**: Skips hidden files and directories.
    - **entryPath**: The full path to the current entry.
    - **relPath**: The relative path to the current entry from the root.
    - **if (entry.isDirectory())**: Checks if the entry is a directory.
      - **children**: Recursively calls `buildDirectoryTree` for the subdirectory.
      - **result.push({...})**: Adds the directory to the result if it contains any children.
    - **else if (entry.isFile() && entry.name.endsWith('.md'))**: Checks if the entry is a Markdown file.
      - **result.push({...})**: Adds the file to the result, removing the `.md` extension.
  - **return result.sort(...)**: Sorts the result array with folders first and then files, both in alphabetical order.

#### API Endpoint: Get Documentation Tree

```javascript
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
```
- **router.get('/tree', ...)**: Defines a GET endpoint at `/tree`.
- **console.log('Looking for docs in:', DOCS_ROOT);**: Logs the documentation root directory path.
- **try { await fs.access(DOCS_ROOT); ... } catch (err) { ... }**:
  - **fs.access(DOCS_ROOT)**: Checks if the documentation directory exists and is accessible.
  - **if successful**: Logs that the docs directory exists.
  - **if failed**: Logs an error and sends a 500 response with an error message and the expected path.
- **const tree = await buildDirectoryTree(DOCS_ROOT);**: Builds the directory tree structure.
- **res.json(tree);**: Sends the tree structure as a JSON response.
- **catch (error) { ... }**: Catches any errors during the process and sends a 500 response with an error message.

#### API Endpoint: Get Document Content

```javascript
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
```
- **router.get('/content', ...)**: Defines a GET endpoint at `/content`.
- **const docPath = req.query.path;**: Retrieves the `path` query parameter from the request URL.
- **if (!docPath) { ... }**: Checks if the `path` parameter is provided.
  - **if not**: Sends a 400 response with an error message.
- **const fullPath = path.join(DOCS_ROOT, `${docPath}.md`);**: Constructs the full file path by appending `.md` to the provided path.
- **const normalizedFullPath = path.normalize(fullPath);**: Normalizes the path to prevent path traversal attacks.
- **if (!normalizedFullPath.startsWith(DOCS_ROOT)) { ... }**: Ensures the normalized path starts with the documentation root directory.
  - **if not**: Sends a 403 response with an access denied message.
- **const content = await fs.readFile(fullPath, 'utf8');**: Reads the content of the Markdown file as a UTF-8 string.
- **res.send(content);**: Sends the file content as the response.
- **catch (error) { ... }**:
  - **console.error('Error reading markdown file:', error);**: Logs the error.
  - **if (error.code === 'ENOENT') { ... }**: Checks if the error is due to the file not being found.
    - **if yes**: Sends a 404 response with a document not found message.
    - **else**: Sends a 500 response with a failure message.

#### Exporting the Router

```javascript
export default router;
```
- **export default router;**: Exports the router so it can be used in other parts of the application.

---

This step-by-step explanation breaks down the code into understandable sections, illustrating how the server handles requests to list documentation files and retrieve their content.