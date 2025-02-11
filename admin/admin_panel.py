import tkinter as tk
from tkinter import messagebox
import networkx as nx
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import numpy as np

class AdminPanel:
    def __init__(self, window):
        self.window = window
        self.window.title("Transaction Mind Map")
        self.window.geometry("1200x800")
        self.window.configure(bg='#1a1a1a')

        # Enhanced transaction data with central node:cite[7]
        self.transactions = [
            {"from": "CORE", "to": "Account A", "amount": 100, "date": "2025-02-10"},
            {"from": "CORE", "to": "Account B", "amount": 250, "date": "2025-02-11"},
            {"from": "CORE", "to": "Account C", "amount": 300, "date": "2025-02-12"},
            {"from": "Account A", "to": "Account D", "amount": 150, "date": "2025-02-13"},
            {"from": "Account B", "to": "Account E", "amount": 200, "date": "2025-02-14"},
            {"from": "Account C", "to": "Account F", "amount": 180, "date": "2025-02-15"},
            {"from": "Account D", "to": "Sub 1", "amount": 90, "date": "2025-02-16"},
            {"from": "Account D", "to": "Sub 2", "amount": 60, "date": "2025-02-17"},
            {"from": "Account E", "to": "Sub 3", "amount": 110, "date": "2025-02-18"},
            {"from": "Account F", "to": "Sub 4", "amount": 130, "date": "2025-02-19"},
        ]

        self.G = nx.Graph()
        self._build_graph()
        self._create_gui()

    def _build_graph(self):
        # Add central node and connections
        self.G.add_node("CORE", type='central')
        for transaction in self.transactions:
            self.G.add_nodes_from([transaction["from"], transaction["to"]])
            self.G.add_edge(transaction["from"], transaction["to"], 
                          amount=transaction["amount"], 
                          date=transaction["date"])

    def _create_gui(self):
        # Graph frame with dark theme
        self.graph_frame = tk.Frame(self.window, bg='#1a1a1a')
        self.graph_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        # Configure matplotlib dark theme
        plt.style.use('dark_background')
        fig = plt.figure(figsize=(10, 8), facecolor='#1a1a1a')
        ax = fig.add_subplot(111, facecolor='#1a1a1a')
        
        # Create hierarchical layout:cite[6]:cite[7]
        pos = nx.spring_layout(self.G, k=0.3, seed=42, scale=2)
        pos["CORE"] = np.array([0, 0])  # Center position

        # Node styling
        node_colors = ['#268bd2' if node == "CORE" else '#2aa198' 
                      for node in self.G.nodes()]
        node_sizes = [4000 if node == "CORE" else 2500 
                     for node in self.G.nodes()]

        # Edge styling
        nx.draw_networkx_edges(
            self.G, pos, 
            edge_color='#586e75', 
            width=1.5, 
            alpha=0.8,
            connectionstyle="arc3,rad=0.1"  # Curved edges:cite[7]
        )

        # Node drawing
        nx.draw_networkx_nodes(
            self.G, pos,
            node_color=node_colors,
            node_size=node_sizes,
            edgecolors='#839496',
            linewidths=2
        )

        # Label styling
        nx.draw_networkx_labels(
            self.G, pos,
            font_size=10,
            font_family='sans-serif',
            font_color='#fdf6e3',
            bbox=dict(facecolor='#073642', alpha=0.8, edgecolor='none')
        )

        # Edge labels with transaction details
        edge_labels = {(u, v): f"${d['amount']}\n{d['date']}" 
                      for u, v, d in self.G.edges(data=True)}
        nx.draw_networkx_edge_labels(
            self.G, pos,
            edge_labels=edge_labels,
            font_color='#839496',
            font_size=8,
            label_pos=0.5
        )

        # Embed plot
        canvas = FigureCanvasTkAgg(fig, master=self.graph_frame)
        canvas.draw()
        canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)
        canvas.get_tk_widget().bind("<Button-1>", self.on_click)

    def on_click(self, event):
        # Improved node detection with tolerance:cite[8]
        ax = plt.gca()
        x, y = ax.transData.inverted().transform((event.x, event.y))
        
        closest_node = min(
            self.G.nodes(),
            key=lambda node: np.hypot(pos[node][0]-x, pos[node][1]-y)
        )
        
        if np.hypot(pos[closest_node][0]-x, pos[closest_node][1]-y) < 0.1:
            self._show_node_details(closest_node)

    def _show_node_details(self, node):
        details = []
        if node == "CORE":
            details.append("Central Transaction Hub")
        else:
            details.append(f"Account: {node}")
            
        for edge in self.G.edges(node, data=True):
            details.append(
                f"{edge[0]} → {edge[1]}\n"
                f"Amount: ${edge[2]['amount']}\n"
                f"Date: {edge[2]['date']}"
            )
            
        self._create_detail_window("\n\n".join(details))

    def _create_detail_window(self, content):
        detail_win = tk.Toplevel(self.window)
        detail_win.title("Node Details")
        detail_win.configure(bg='#1a1a1a')
        
        text = tk.Text(detail_win, wrap=tk.WORD, bg='#073642', fg='#839496',
                      font=('Sans Serif', 10), padx=10, pady=10)
        text.insert(tk.END, content)
        text.pack(fill=tk.BOTH, expand=True)
        text.configure(state='disabled')

if __name__ == "__main__":
    root = tk.Tk()
    admin_panel = AdminPanel(root)
    root.mainloop()