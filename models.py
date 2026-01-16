
from enum import Enum
from dataclasses import dataclass, field
from typing import List, Optional

class TransactionType(Enum):
    INCOME = "income"
    EXPENSE = "expense"
    PARKED = "parked"
    TRANSFER = "transfer"

@dataclass
class Settings:
    currency_symbol: str = "$"
    currency_code: str = "USD"
    bank_accounts: List[str] = field(default_factory=lambda: ["Cash", "Main Bank"])
    expense_categories: List[str] = field(default_factory=lambda: ["Food", "Transport", "Shopping", "Bills", "Health", "Other"])
    income_categories: List[str] = field(default_factory=lambda: ["Salary", "Freelance", "Investment", "Gift"])
    privacy_mode: bool = True
    enable_ai: bool = True
    primary_account: str = "Main Bank"
