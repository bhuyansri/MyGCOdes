# FinTrack AI - Local Setup Guide

This document provides a comprehensive, step-by-step guide to setting up **FinTrack AI** on your local computer.

## 1. Prerequisites

Before starting, ensure you have the following installed:
*   **Node.js** (v18 or higher): [Download Here](https://nodejs.org/)
*   **A Code Editor**: VS Code is recommended.

## 2. Initialize the Project

Open your terminal/command prompt and run the following commands to create the project shell using Vite.

```bash
# 1. Create a new project (select 'React' framework and 'TypeScript' variant when prompted)
npm create vite@latest fintrack-ai -- --template react-ts

# 2. Navigate into the folder
cd fintrack-ai

# 3. Install default dependencies
npm install
```

## 3. Install Required Libraries

Install the specific libraries used by FinTrack AI:

```bash
npm install lucide-react react-markdown recharts uuid @google/genai
```

## 4. Setup Tailwind CSS

Since you have encountered issues with the CLI, we will install the dependencies manually. The configuration files (`tailwind.config.js` and `postcss.config.js`) have already been provided in the code package, so you **do not** need to run `npx tailwindcss init`.

Just run this command to install the tools:

```bash
npm install -D tailwindcss postcss autoprefixer
```

*Note: The system has automatically created `src/index.css` and imported it into your app, so styling should work immediately after starting the server.*

## 5. Add Application Code

Ensure your file structure matches the provided code:
*   `src/components/` (Contains all View files)
*   `src/services/` (Contains `databaseService.ts` and `geminiService.ts`)
*   `src/index.css` (Contains Tailwind directives)
*   Root files: `.env`, `tailwind.config.js`, `postcss.config.js`

## 6. API Key Configuration

To use the AI features, you need a Google Gemini API Key.

1.  Get a key from [Google AI Studio](https://aistudio.google.com/).
2.  Create a file named `.env` in the root of your project.
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

To turn this into a mobile app using Capacitor:

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