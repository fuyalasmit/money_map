import tkinter as tk
from tkinter import messagebox
from ttkthemes import ThemedTk  # For cool themes

# Import client and admin panel windows (we'll create these next)
from client.client_panel import ClientPanel
from admin.admin_panel import AdminPanel

class LandingPage:
    def __init__(self, root):
        self.root = root
        self.root.title("Money Map - Landing Page")
        self.root.geometry("350x250")  # Slightly bigger for a clean look

        # Set the theme for the window
        self.root = ThemedTk(theme="arc")  # Modern theme like "arc", "radiance", "ubuntu", etc.
        
        # Set background color
        self.root.configure(bg="#F4F4F9")

        # Welcome label with custom font and colors
        self.label = tk.Label(root, text="Welcome to Money Map", font=("Helvetica", 16, "bold"), bg="#F4F4F9", fg="#333333")
        self.label.pack(pady=30)

        # Buttons with better style
        self.client_button = tk.Button(root, text="Client Panel", width=20, height=2, command=self.open_client_panel, bg="#4CAF50", fg="white", relief="flat", font=("Helvetica", 12, "bold"))
        self.client_button.pack(pady=10)

        self.admin_button = tk.Button(root, text="Admin Panel", width=20, height=2, command=self.open_admin_panel, bg="#f44336", fg="white", relief="flat", font=("Helvetica", 12, "bold"))
        self.admin_button.pack(pady=10)

        # Footer with some extra info
        self.footer_label = tk.Label(root, text="Powered by Team Money Map", font=("Arial", 10), bg="#F4F4F9", fg="#555555")
        self.footer_label.pack(side="bottom", pady=10)

    def open_client_panel(self):
        self.root.withdraw()  # Hide the landing page
        client_window = tk.Toplevel(self.root)  # Create a new window for client panel
        ClientPanel(client_window)

    def open_admin_panel(self):
        self.root.withdraw()  # Hide the landing page
        admin_window = tk.Toplevel(self.root)  # Create a new window for admin panel
        AdminPanel(admin_window)

# Initialize the Tkinter root window and show landing page
if __name__ == "__main__":
    root = tk.Tk()
    landing_page = LandingPage(root)
    root.mainloop()