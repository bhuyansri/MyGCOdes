# FinTrack AI

A smart personal finance tracker built with React, Tailwind CSS, and Google Gemini AI.

## 🚀 1. Setup & Installation

To run this project locally on your machine (VS Code recommended):

1.  **Install Node.js:** Download from [nodejs.org](https://nodejs.org).
2.  **Initialize Project:**
    ```bash
    npm create vite@latest fintrack-ai -- --template react-ts
    cd fintrack-ai
    npm install
    npm install lucide-react react-markdown recharts uuid @google/genai
    npm install -D tailwindcss postcss autoprefixer
    npx tailwindcss init -p
    ```
3.  **Copy Code:** Copy the files from the web editor into your local `src/` folder.
4.  **API Key:** Create a file named `.env` in the root folder and add:
    ```
    VITE_API_KEY=your_gemini_api_key_here
    ```
    *(Note: In Vite, use `import.meta.env.VITE_API_KEY` instead of `process.env`).*

## 🛠 2. Source Code Management (Git)

We use Git to track changes.

1.  **Initialize:**
    ```bash
    git init
    ```
2.  **Save Changes:**
    ```bash
    git add .
    git commit -m "Initial commit"
    ```
3.  **Branching (Best Practice):**
    Never work directly on `main`. Create a branch for new features:
    ```bash
    git checkout -b feature/add-dark-mode
    # ... make changes ...
    git commit -m "Added dark mode"
    git checkout main
    git merge feature/add-dark-mode
    ```

## 📱 3. How to Make this an Android App

Since you have programming knowledge but aren't an Android dev, use **Capacitor**. It wraps this React app into a native Android container.

1.  **Install Capacitor:**
    ```bash
    npm install @capacitor/core @capacitor/cli @capacitor/android
    npx cap init
    ```
2.  **Build the Web App:**
    ```bash
    npm run build
    ```
3.  **Add Android Platform:**
    ```bash
    npx cap add android
    ```
4.  **Sync and Open:**
    ```bash
    npx cap sync
    npx cap open android
    ```
    *This will open Android Studio. Simply plug in your phone and hit the "Play" (Run) button to install the app on your real device.*

## 🧪 4. Testing Strategy

### Manual Mobile Testing
1.  Open your browser Developer Tools (F12).
2.  Click the "Device Toolbar" (Icon of a phone/tablet).
3.  Select "Pixel 7" or "iPhone 12".
4.  Reload the page. This simulates touch events and screen size.

### Automated Testing
To ensure the app logic doesn't break:
1.  Run `npm install -D vitest`.
2.  Create test files like `utils.test.ts` to test your calculation logic (e.g., verifying `totalIncome` math).

## 📂 Project Structure

- `/src/components`: UI Views (Dashboard, Analytics, etc.)
- `/src/services`: External API logic (Gemini AI)
- `/src/types`: TypeScript interfaces
- `/src/App.tsx`: Main navigation logic
