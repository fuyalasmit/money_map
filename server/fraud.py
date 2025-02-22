import networkx as nx
import matplotlib.pyplot as plt
from collections import deque

class TransactionGraph:
    def __init__(self):
        self.graph = nx.DiGraph()  # Directed Graph

    def add_transaction(self, sender, receiver, amount):
        self.graph.add_edge(sender, receiver, amount=amount)

    def visualize(self):
        pos = nx.spring_layout(self.graph)
        labels = nx.get_edge_attributes(self.graph, 'amount')
        nx.draw(self.graph, pos, with_labels=True, node_color='lightblue', edge_color='red')
        nx.draw_networkx_edge_labels(self.graph, pos, edge_labels=labels)
        plt.show()

# Example usage
transactions = TransactionGraph()
transactions.add_transaction("Ankit", "Kisi", 5000)
transactions.add_transaction("Kisi", "Asmit", 2000)
transactions.add_transaction("Ankit", "Asmit", 15000)
transactions.add_transaction("Kisi", "Ankit", 10000)
# transactions.add_transaction("X", "Y", 15000) 
transactions.visualize()

def detect_cycle(graph):
    try:
        cycle = nx.find_cycle(graph, orientation="original")
        return cycle
    except nx.NetworkXNoCycle:
        return None

cycle = detect_cycle(transactions.graph)
if cycle:
    print("⚠️ Money laundering detected:", cycle)
else:
    print("✅ No suspicious cycles detected.")


def detect_suspicious_activity(graph, start, max_depth=3):
    queue = deque([(start, 0)])
    visited = set()

    while queue:
        account, depth = queue.popleft()
        if depth > max_depth:
            break
        if account not in visited:
            visited.add(account)
            for neighbor in graph.neighbors(account):
                queue.append((neighbor, depth + 1))

    return visited

suspicious_accounts = detect_suspicious_activity(transactions.graph, "A")
print("🚨 Suspicious Accounts:", suspicious_accounts)