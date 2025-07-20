# 🧠 ChatGPT Development Kit

The open‑source boilerplate that packs the core ChatGPT experience into a Vite + React front end and a Node + Express back end.

## ✨ Features

This development kit replicates the **core ChatGPT experience** and extends it with rich multimodal and interactive features:

- 💬 **Multimodal Chat** – Combine text, image, audio, and document inputs in a single conversation flow.
- ⚡ **Real-Time Streaming Chat** – Token-by-token message updates for a smoother user experience.
- 🔍 **Search-Enhanced Responses** – Integrate web or custom document search to improve answer quality.

- 🔬 **Deep Research** – Conduct comprehensive research using AI with access to web search and code execution, featuring real-time progress tracking, optional clarifications, and custom source prioritization.

- 🎙️ **Voice Interaction** – Record, send, and respond to voice messages with microphone support or Twilio.
- 📝 **Audio Transcription** – Use Whisper or OpenAI APIs to convert voice notes into readable text.
- 🖼️ **Image Generation** – Generate images using **DALL·E 3** and the new **gpt-imagens** models.
- 🎨 **Inpaint Mode** – Upload an image, select areas, and let AI redraw or enhance them with context.
- 👁️ **Vision Input (GPT-4o)** – Upload screenshots, UIs, or real-world photos for visual reasoning and analysis.
- 📄 **Document Support** – Upload and query **PDF** and **Word (.docx)** files using memory-friendly techniques.
- 🧠 **Context Memory** – Easily implement memory systems via sliding windows, summarization, and thread-saving.
- 🧩 **Canvas Interaction** – Enable AI to **reason spatially or visually** via a digital canvas for drawing, layout, and visual planning (like OpenAI’s JSON canvas mode).
- 🧪 **OpenAI-Compatible** – Built for use with GPT-4o and future models with new modalities and tool use.



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


## 📚 Learn as You Build

Want a **step‑by‑step beginner guide** to OpenAI, memory strategies, streaming, and more?  
Grab the **free tutorial** here:  
👉 **https://www.the-aideveloper.com/openai**

---


## 🤝 Contributing

Pull requests are welcome! Please open an issue first to discuss major changes.  
All contributors must follow OpenAI’s [usage policies](https://platform.openai.com/docs/usage-policies).

---

## 📜 License

- **Code**: MIT License — free for personal and commercial projects, attribution appreciated.  
- **Documentation & media**: Creative Commons **CC BY 4.0**.  
- **OpenAI API keys**: You must supply your own key and comply with OpenAI’s Terms of Service.

---

## 📬 Connect with Me

🌐 **The AI Developer**  
- **YouTube** · [The AI Developer](https://www.youtube.com/@theaideveloper)  
- **Instagram** · [@cptheaideveloper](https://www.instagram.com/cptheaideveloper/)  
- **Twitter/X** · [@cpaideveloper](https://x.com/cpaideveloper)  
- **TikTok** · [@codingnutella](https://www.tiktok.com/@codingnutella)  
- **LinkedIn** · [The AI Developer](https://www.linkedin.com/company/theaidevelopercp/)  
- **GitHub** · [The AI Developer](https://github.com/cpTheAideveloper)  

> **🔥  Like what you see?** Star ⭐ the repo and follow for deep‑dives, tips, and the upcoming pro release!


## 🛠 Author's Note

This is the perfect starting point for creating a ChatGPT-based app with minimal config and maximum flexibility. Happy coding!
