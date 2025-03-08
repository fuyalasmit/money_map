import random
import datetime
import json
import string

# List of 50 names (shortened here for brevity; expand to 50)
names = [
    "Arjun", "Meera", "Mohammed Ibrahim", "Aisha Abdulrahman", "Omar Farooq",
    "Rajesh", "Priya", "Sanjay", "Kavita", "Amit", "Anjali", "Vikram", "Neha",
    # Add more names to reach 50
]

# Assign unique account numbers
account_numbers = random.sample(range(100000, 1000000), len(names))
name_to_account = dict(zip(names, account_numbers))

# List of remarks
remarks = [
    "House Rent", "Business Loan", "Investment", "Salary", "Gift", "Utilities",
    "Groceries", "Travel Expenses", "Medical Expenses", "Education Fees",
    "Charity", "Repairs", "Entertainment", "Miscellaneous"
]

# Function to generate random timestamp in 2025
def random_timestamp():
    start = datetime.datetime(2025, 1, 1, 0, 0, 0)
    end = datetime.datetime(2025, 12, 31, 23, 59, 59)
    delta = end - start
    random_second = random.randint(0, int(delta.total_seconds()))
    return (start + datetime.timedelta(seconds=random_second)).isoformat() + "Z"

# Generate 200 transactions
transactions = []
for _ in range(200):
    sender_name = random.choice(names)
    receiver_name = random.choice([name for name in names if name != sender_name])
    transaction = {
        "senderName": sender_name,
        "senderAccount": str(name_to_account[sender_name]),
        "receiverName": receiver_name,
        "receiverAccount": str(name_to_account[receiver_name]),
        "remarks": random.choice(remarks),
        "amount": str(random.randint(1000, 1000000)),
        "timestamp": random_timestamp(),
        "transactionId": "".join(random.choices(string.ascii_letters + string.digits, k=10)),
        "label": "suspicious" if random.random() < 0.2 else "clean"
    }
    transactions.append(transaction)

# Save to JSON file
with open("transactions.json", "w") as f:
    json.dump(transactions, f, indent=2)