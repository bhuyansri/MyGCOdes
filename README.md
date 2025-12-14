# FinTrack AI - Local Setup Guide

This document provides a comprehensive, step-by-step guide to setting up **FinTrack AI** on your local computer.

## 1. Prerequisites

Before starting, ensure you have the following installed:
*   **Node.js** (v18 or higher): [Download Here](https://nodejs.org/)
*   **A Code Editor**: VS Code is recommended.

## 2. Initialize the Project

Open your terminal/command prompt and run the following commands to create the project shell using Vite (a modern frontend build tool).

```bash
# 1. Create a new project (select 'React' framework and 'TypeScript' variant when prompted)
npm create vite@latest fintrack-ai -- --template react-ts

# 2. Navigate into the folder
cd fintrack-ai

# 3. Install default dependencies
npm install
```

## 3. Install Required Libraries

Install the specific libraries used by FinTrack AI (Icons, Charts, AI SDK, etc.):

```bash
npm install lucide-react react-markdown recharts uuid @google/genai
```

## 4. Setup Tailwind CSS (Styles)

This is the step where errors often occur. Please follow these commands exactly in order.

### Step A: Install Tailwind Dependencies
You must install the packages before you can run the initialization command.

```bash
npm install -D tailwindcss postcss autoprefixer
```

### Step B: Initialize Configuration
Run the command to generate `tailwind.config.js` and `postcss.config.js`.

```bash
npx tailwindcss init -p
```

**⚠️ Troubleshooting:**
If you see the error *"npm error could not determine executable to run"*:
1.  Ensure **Step A** completed successfully without errors.
2.  Try running the local binary directly:
    ```bash
    ./node_modules/.bin/tailwindcss init -p
    ```
    *(On Windows Command Prompt, use `.\node_modules\.bin\tailwindcss init -p`)*

### Step C: Configure `tailwind.config.js`
Open the generated `tailwind.config.js` file in your editor and replace `content: []` with:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Step D: Add Directives
Open `src/index.css` and **replace everything** in it with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 5. Add Application Code

You now need to create the files and folders to match the app structure.

1.  **Delete** existing files in `src/` except `vite-env.d.ts` (if it exists).
2.  **Create Folders**:
    *   `src/components`
    *   `src/services`
3.  **Create Files**:
    *   Copy the code provided for each component (e.g., `DashboardView.tsx`, `AddTransactionView.tsx`) into `src/components/`.
    *   Copy `databaseService.ts` and `geminiService.ts` into `src/services/`.
    *   Copy `types.ts`, `App.tsx`, and `index.tsx` into `src/`.
    *   Update `index.html` in the root folder with the provided HTML code.

## 6. API Key Configuration

To use the AI features, you need a Google Gemini API Key.

1.  Get a key from [Google AI Studio](https://aistudio.google.com/).
2.  Create a file named `.env` in the root of your project (next to `package.json`).
3.  Add your key:

```env
VITE_API_KEY=your_actual_api_key_starts_with_AIza
```

## 7. Run the App

```bash
npm run dev
```

*   The terminal will show a link (e.g., `http://localhost:5173`).
*   Open that link in your browser to use the app.

## 8. Build for Android (Optional)

To turn this into a mobile app:

```bash
# 1. Build the web assets
npm run build

# 2. Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init

# 3. Add Android platform
npx cap add android

# 4. Open in Android Studio
npx cap open android
```
