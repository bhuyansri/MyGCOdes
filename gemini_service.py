
import os
from google import genai

class GeminiService:
    def __init__(self):
        # Uses the API_KEY from environment variables
        api_key = os.environ.get("API_KEY")
        if api_key:
            self.client = genai.Client(api_key=api_key)
        else:
            self.client = None

    def get_financial_advice(self, transactions: list) -> str:
        if not self.client:
            return "API Key not found. Please set the API_KEY environment variable."
            
        if not transactions:
            return "Please add some transactions first so I can analyze your spending."

        summary = "\n".join([
            f"- {tx['date']}: {tx['type'].upper()} of {tx['amount']} for {tx['category']}"
            for tx in transactions[:20]
        ])

        prompt = f"""
        You are a friendly personal finance AI. Analyze these recent transactions:
        {summary}
        
        Provide:
        1. A quick summary of spending.
        2. Three actionable tips to save money.
        
        Use markdown formatting and keep it brief.
        """

        try:
            response = self.client.models.generate_content(
                model='gemini-2.0-flash-exp',
                contents=prompt
            )
            return response.text
        except Exception as e:
            return f"Error connecting to AI: {str(e)}"
