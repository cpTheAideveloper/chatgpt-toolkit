# 🧠 ChatGPT Development Kit

This project provides a clean starting point for building AI chat applications with a **Vite + React + Tailwind CSS** frontend and a **Node.js + Express** backend connected to the **OpenAI API**.

---

## 📁 Understanding Your Project Structure

```
project-root/
├── src/                     # Frontend source files
│   ├── assets/             # Static files (images, icons, etc.)
│   ├── components/         # Reusable UI components
│   ├── pages/              # Application screens
│   ├── App.jsx             # Root React component
│   ├── index.css           # Tailwind CSS configuration
│   └── main.jsx            # React entry point
│
├── node/                   # Backend server files
│   ├── demoapproutes/     # Demo or temp routes
│   ├── routes/            # API endpoints
│   ├── utils/             # Helper functions
│   ├── index.js           # Server entry point
│   ├── .env               # Environment variables
│   └── package.json       # Backend dependencies & scripts
```

---

## ⚛️ Frontend Setup

The frontend is built using **Vite + React**, styled with **Tailwind CSS 4.0**, and enhanced with:

- `lucide-react`: Customizable SVG icons
- `react-markdown`: Markdown rendering
- `motion`: Framer Motion animation
- `prism-react-renderer`: Code highlighting

### 🔧 Create a Vite App

```bash
npm create vite@latest
```

Or directly:

```bash
npm create vite@latest my-react-app -- --template react
```

### 📦 Install Dependencies

```bash
cd my-react-app
npm install lucide-react react-markdown motion prism-react-renderer tailwindcss @tailwindcss/vite
```

### 📁 Configure Vite Aliases

In `vite.config.js` or `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  plugins: [react()],
})
```

### 🎨 Tailwind CSS Setup

In your CSS file (`index.css`):

```css
@import "tailwindcss";
```

### 🚀 Start the Frontend Server

```bash
npm run dev
```

---

## 🧩 Backend Setup

The backend is a simple Express server with OpenAI integration.

### 📁 Initialize Backend Project

```bash
mkdir node && cd node
npm init -y
touch .env
```

### 📦 Install Dependencies

```bash
npm install express cors dotenv openai multer
npm install -D nodemon
```

### 🛠️ Configure `package.json`

```json
{
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  }
}
```

### 🔑 Create `.env` File

```env
OPENAI_API_KEY=your_api_key_here
PORT=8000
```

### 📝 `index.js` Sample

```js
import express from "express";
import { config } from "dotenv";
import cors from "cors";

config();
const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running successfully.");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
```

### ▶️ Run the Backend

```bash
npm run dev
```

Visit [http://localhost:8000](http://localhost:8000) to confirm it returns:

```
Backend is running successfully.
```

---

## 📘 Documentation

All documentation is embedded in code comments and structured in folders:
- Frontend logic is inside `src/`
- Backend logic is inside `node/`
- API keys and sensitive config go in `.env`

Feel free to expand with:
- `README_CLIENT.md`
- `README_BACKEND.md`
- `.vscode/settings.json` for dev tools

---

## 🛠 Author's Note

This is the perfect starting point for creating a ChatGPT-based app with minimal config and maximum flexibility. Happy coding!
