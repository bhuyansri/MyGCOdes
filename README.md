
# FinTrack AI - Python Flet Version

This version of FinTrack AI is built using Python and Flet for a native Android-like experience.

## Prerequisites
1. Install Python 3.9 or higher.
2. Install the required libraries:
   ```bash
   pip install -r requirements.txt
   ```

## Running the App
1. Set your Google Gemini API Key:
   - **Windows**: `set API_KEY=your_key_here`
   - **Mac/Linux**: `export API_KEY=your_key_here`
2. Launch the app:
   ```bash
   python main.py
   ```

## Mobile (Android) Build
To run this on your Android device:
1. Install the **Flet** app from the Google Play Store.
2. Run the command:
   ```bash
   flet run --android
   ```
   Or use the Flet CLI to build a standalone APK using `flet build apk`.

## Project Structure
- `main.py`: Main UI and Navigation logic.
- `models.py`: Data definitions.
- `database_service.py`: Local storage wrapper around Flet's `client_storage`.
- `gemini_service.py`: Integration with Google's GenAI Python SDK.
