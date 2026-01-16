
import json
import flet as ft
from models import Settings
from typing import List

class DatabaseService:
    def __init__(self, page: ft.Page):
        self.page = page

    def get_settings(self) -> Settings:
        data = self.page.client_storage.get("fintrack_settings")
        if not data:
            return Settings()
        try:
            d = json.loads(data)
            return Settings(**d)
        except:
            return Settings()

    def save_settings(self, settings: Settings):
        data = {
            "currency_symbol": settings.currency_symbol,
            "currency_code": settings.currency_code,
            "bank_accounts": settings.bank_accounts,
            "expense_categories": settings.expense_categories,
            "income_categories": settings.income_categories,
            "privacy_mode": settings.privacy_mode,
            "enable_ai": settings.enable_ai,
            "primary_account": settings.primary_account
        }
        self.page.client_storage.set("fintrack_settings", json.dumps(data))

    def get_transactions(self) -> List[dict]:
        data = self.page.client_storage.get("fintrack_transactions")
        return json.loads(data) if data else []

    def add_transaction(self, tx: dict):
        txs = self.get_transactions()
        txs.insert(0, tx)
        self.page.client_storage.set("fintrack_transactions", json.dumps(txs))

    def get_goals(self) -> List[dict]:
        data = self.page.client_storage.get("fintrack_goals")
        return json.loads(data) if data else []

    def add_goal(self, goal: dict):
        goals = self.get_goals()
        goals.append(goal)
        self.page.client_storage.set("fintrack_goals", json.dumps(goals))
