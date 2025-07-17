## Frontend Setup
The frontend is built using Vite + React, with support for Tailwind CSS 4.0 for styling and Prism, Motion, Lucide, and Markdown rendering for enhanced UI.
It includes:

A fast and modern development environment using Vite.

Shorthand import setup (@ alias to /src) to simplify imports.

Dependencies installed for interactive chat UI elements.

Tailwind CSS setup for rapid, utility-first styling.

This part focuses on setting up the UI quickly and cleanly, using the best tools in the React ecosystem

### Client Initial Setup with Vite

To quickly create a new client application, run the following command in your terminal:

```bash
npm create vite@latest
```

Follow the prompts to choose your project name and template. For example, if you prefer a React template, select React when prompted.

You can also specify the project name and template directly from the command line. For example, to scaffold a React + Vue project, run:

```bash
npm create vite@latest my-react-app -- --template react
```

### Install Dependencies
After creating your Vite app, navigate into your project folder:

```bash
cd your-project-name
```

Then install the following dependencies required for the chat interface:

```bash
npm install lucide-react react-markdown motion prism-react-renderer tailwindcss @tailwindcss/vite
```

- `lucide-react`: Icon library for React with customizable SVG icons.
- `react-markdown`: Renders Markdown content as HTML in React apps.
- `motion`: Animation library for React by Framer, used for smooth transitions and effects.
- `prism-react-renderer`: Syntax highlighting for code blocks in React using PrismJS.
- `tailwindcss`: Utility-first CSS framework for rapid UI development.
- `@tailwindcss/vite`: Tailwind CSS plugin for seamless integration with Vite.


### Enable Shorthand Imports (Path Aliases) in Vite

To clean up your import paths and avoid deeply nested relative imports like `../../../components/MyComponent`, you can define path aliases using Vite’s native `resolve.alias` feature.

1. Update `vite.config.js` or `vite.config.ts`

Add an alias to your configuration file so that `@` points to the `src` directory:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': '/src', // or your preferred alias
    },
  },
  plugins: [react(),],
})
```


### Tailwind CSS 4.0 Configuration for Vite
Tailwind CSS scans your project’s files for class names and generates the corresponding styles. Follow these steps to integrate Tailwind CSS as a Vite plugin:


1. Configure the Vite Plugin
Create or update your `vite.config.ts` file with the following configuration:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
    resolve: {
    alias: {
      '@': '/src', // or your preferred alias
    },
  },
  plugins: [react(), tailwindcss(),],
})
```

### Import Tailwind CSS in Your CSS File
Create or update your main CSS file (e.g., `src/index.css`) and include the Tailwind import:

```css
@import "tailwindcss";
```

### Run Your Development Server
Start your build process with:

```bash
npm run dev
```

