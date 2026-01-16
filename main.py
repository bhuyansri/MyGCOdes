
import flet as ft
import uuid
import datetime
from models import Settings
from database_service import DatabaseService
from gemini_service import GeminiService

def main(page: ft.Page):
    page.title = "FinTrack AI"
    page.theme_mode = ft.ThemeMode.LIGHT
    page.theme = ft.Theme(color_scheme_seed=ft.colors.INDIGO)
    
    # Adaptive layout for Web or Window
    page.window_width = 450
    page.window_height = 850
    
    db = DatabaseService(page)
    ai_service = GeminiService()

    def navigate(e):
        index = e.control.selected_index
        routes = ["/dashboard", "/analytics", "/advisor"]
        page.go(routes[index])

    navbar = ft.NavigationBar(
        destinations=[
            ft.NavigationBarDestination(icon=ft.icons.DASHBOARD_ROUNDED, label="Home"),
            ft.NavigationBarDestination(icon=ft.icons.BAR_CHART_ROUNDED, label="Analytics"),
            ft.NavigationBarDestination(icon=ft.icons.AUTO_AWESOME_ROUNDED, label="AI Advisor"),
        ],
        on_change=navigate,
    )

    def route_change(route):
        page.views.clear()
        settings = db.get_settings()
        
        # --- DASHBOARD ---
        if page.route == "/dashboard" or page.route == "/":
            txs = db.get_transactions()
            balance = sum(t['amount'] if t['type'] == 'income' else -t['amount'] for t in txs)
            
            tx_list = ft.ListView(expand=True, spacing=10, padding=20)
            for t in txs:
                is_income = t['type'] == 'income'
                tx_list.controls.append(
                    ft.Card(
                        content=ft.ListTile(
                            leading=ft.Icon(ft.icons.ATTACH_MONEY, color=ft.colors.GREEN if is_income else ft.colors.RED),
                            title=ft.Text(t['category'], weight="bold"),
                            subtitle=ft.Text(f"{t['date']} • {t['note']}"),
                            trailing=ft.Text(f"{settings.currency_symbol}{t['amount']:.2f}", weight="bold")
                        )
                    )
                )

            page.views.append(
                ft.View(
                    "/dashboard",
                    [
                        ft.AppBar(title=ft.Text("FinTrack AI"), bgcolor=ft.colors.SURFACE_VARIANT),
                        ft.Container(
                            content=ft.Column([
                                ft.Text("Available Balance", size=16, color=ft.colors.WHITE70),
                                ft.Text(f"{settings.currency_symbol}{balance:,.2f}", size=40, weight="bold", color=ft.colors.WHITE),
                            ], horizontal_alignment="center"),
                            bgcolor=ft.colors.INDIGO,
                            padding=40,
                            border_radius=20,
                            margin=20,
                        ),
                        ft.Text("Recent Transactions", padding=ft.padding.only(left=20), weight="bold"),
                        tx_list,
                        ft.FloatingActionButton(icon=ft.icons.ADD, on_click=lambda _: page.go("/add"), bgcolor=ft.colors.INDIGO, foreground_color=ft.colors.WHITE),
                    ],
                    navigation_bar=navbar
                )
            )

        # --- ADD TRANSACTION ---
        elif page.route == "/add":
            amount_field = ft.TextField(label="Amount", keyboard_type="number", prefix_text=settings.currency_symbol)
            note_field = ft.TextField(label="Note")
            cat_dropdown = ft.Dropdown(label="Category", options=[ft.dropdown.Option(c) for c in settings.expense_categories])
            type_toggle = ft.SegmentedButton(
                segments=[
                    ft.Segment(value="expense", label=ft.Text("Expense")),
                    ft.Segment(value="income", label=ft.Text("Income")),
                ],
                selected={"expense"}
            )

            def save_tx(e):
                if not amount_field.value: return
                db.add_transaction({
                    "id": str(uuid.uuid4()),
                    "amount": float(amount_field.value),
                    "type": list(type_toggle.selected)[0],
                    "category": cat_dropdown.value or "Other",
                    "note": note_field.value,
                    "date": datetime.date.today().isoformat()
                })
                page.go("/dashboard")

            page.views.append(
                ft.View(
                    "/add",
                    [
                        ft.AppBar(title=ft.Text("Add Transaction")),
                        ft.Container(
                            padding=20,
                            content=ft.Column([
                                type_toggle,
                                amount_field,
                                cat_dropdown,
                                note_field,
                                ft.ElevatedButton("Save", on_click=save_tx, width=400, height=50)
                            ], spacing=20)
                        )
                    ]
                )
            )

        # --- AI ADVISOR ---
        elif page.route == "/advisor":
            advice_md = ft.Markdown("")
            loading = ft.ProgressBar(visible=False)

            def get_advice(e):
                loading.visible = True
                page.update()
                advice_md.value = ai_service.get_financial_advice(db.get_transactions())
                loading.visible = False
                page.update()

            page.views.append(
                ft.View(
                    "/advisor",
                    [
                        ft.AppBar(title=ft.Text("AI Advisor")),
                        ft.Container(
                            padding=20,
                            content=ft.Column([
                                ft.Text("Get Smart Insights", size=20, weight="bold"),
                                loading,
                                advice_md,
                                ft.ElevatedButton("Generate Insights", on_click=get_advice, icon=ft.icons.AUTO_AWESOME)
                            ], spacing=20, scroll="auto")
                        )
                    ],
                    navigation_bar=navbar
                )
            )

        page.update()

    page.on_route_change = route_change
    page.go("/dashboard")

if __name__ == "__main__":
    ft.app(target=main)
