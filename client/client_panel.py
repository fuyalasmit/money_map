import tkinter as tk

class ClientPanel:
    def __init__(self, window):
        self.window = window
        self.window.title("Client Panel")
        self.window.geometry("400x300")

        # Placeholder label for Client Panel
        self.label = tk.Label(window, text="Welcome to Client Panel", font=("Arial", 14))
        self.label.pack(pady=20)

        # Add other client-specific features here (transaction history, send/receive money, etc.)