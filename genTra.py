import random
import datetime
import json
import string

# Keep your existing names list
names = [
    # South Asian
    "Arjun Patel", "Meera Singh", "Mohammed Ibrahim", "Aisha Abdulrahman", "Omar Farooq",
    "Rajesh Kumar", "Priya Sharma", "Sanjay Gupta", "Kavita Reddy", "Amit Shah",
    "Anjali Desai", "Vikram Malhotra", "Neha Verma", "Sunita Rao", "Deepak Chopra",
    "Sachin Tendulkar", "Kiran Bedi", "Akshay Patel", "Indira Nair", "Vijay Mallya",
    
    # East Asian
    "Zhang Wei", "Li Na", "Chen Jie", "Wang Fang", "Liu Yang",
    "Kim Min-ji", "Park Jae-sung", "Lee Ji-eun", "Choi Woo-shik", "Tanaka Yuki",
    "Yamamoto Hiroshi", "Sato Rina", "Nakamura Kenji", "Suzuki Aiko", "Watanabe Daisuke",
    
    # Western
    "James Wilson", "Sarah Johnson", "Michael Brown", "Emma Davis", "Robert Miller",
    "David Thompson", "Jennifer White", "Christopher Lee", "Elizabeth Taylor", "Thomas Anderson",
    "Catherine Williams", "Daniel Jones", "Olivia Martin", "Matthew Clark", "Sophia Roberts",
    
    # Hispanic/Latino
    "Sofia Rodriguez", "Carlos Hernandez", "Isabella Martinez", "Miguel Lopez", "Elena Gonzalez",
    "Jose Garcia", "Gabriela Diaz", "Antonio Morales", "Carmen Sanchez", "Alejandro Torres",
    "Valentina Flores", "Ricardo Ramirez", "Mariana Ortiz", "Javier Mendoza", "Lucia Gutierrez",
    
    # Middle Eastern
    "Fatima Hassan", "Yusuf Ahmed", "Amina Ali", "Abdul Rahman", "Zainab Mahmoud",
    "Mustafa Karim", "Layla Hakim", "Tariq Mahmood", "Samira Khalid", "Hassan Abbas",
    "Nadia Hussein", "Kareem Bishara", "Leila Mansour", "Jamal Nazari", "Amir Faisal",
    
    # Japanese
    "Hiroshi Tanaka", "Yuki Nakamura", "Haruki Sato", "Akira Suzuki", "Yumi Watanabe",
    "Keiko Takahashi", "Taro Yamamoto", "Sakura Kimura", "Ryota Kobayashi", "Emi Saito",
    
    # African
    "Kwame Mensah", "Ama Osei", "Kofi Addo", "Abena Mensah", "Kwesi Owusu",
    "Chibuike Okonkwo", "Folami Adeyemi", "Nkechi Mbanefo", "Oluwaseun Adebayo", "Tendai Moyo",
    "Amare Diop", "Zola Ndlovu", "Sekou Toure", "Amara Conteh", "Thabo Khumalo",
    
    # South Asian (additional)
    "Rahul Dravid", "Lakshmi Narayan", "Raj Malhotra", "Divya Kapoor", "Vivek Oberoi",
    
    # Eastern European
    "Aleksander Nowak", "Natalia Kowalska", "Dmitri Petrov", "Eva Novakova", "Ivan Ivanov",
    "Magda Horvat", "Stefan Kovač", "Olga Popov", "Miroslav Novák", "Katarina Petrović",
    
    # Southeast Asian
    "Aroon Suksawat", "Nurul Abdullah", "Rizwan Ahmad", "Thuy Nguyen", "Dewi Sukarno",
    "Somchai Chaichana", "May Lin Aung", "Trung Pham", "Siti Rahmat", "Bambang Wijaya",
    
    # Nordic
    "Lars Johansson", "Astrid Lindgren", "Erik Nielsen", "Freya Olsen", "Bjorn Andersen",
    "Ingrid Bergman", "Sven Gustafsson", "Maja Nilsson", "Henrik Larsen", "Linnea Holm",
    
    # French/Mediterranean
    "Jean-Pierre Dubois", "Celine Lefebvre", "Marco Rossi", "Sophia Papadopoulos", "Antoine Moreau",
    "Isabelle Laurent", "Giorgos Dimitriou", "Valeria Ricci", "Nicolas Bernard", "Elena Costa",
    
    # Caribbean
    "Kwesi Charles", "Mariana Santos", "Darius Baptiste", "Josefina Vega", "Marcus Garvey",
    "Zara Williams", "Rafael Dominguez", "Shania Roberts", "Orlando Thompson", "Anaya Joseph",
    
    # Persian
    "Darius Shirazi", "Leila Hosseini", "Cyrus Tehrani", "Yasmin Jafari", "Arman Parviz",
    
    # Korean
    "Kim Ji-woo", "Park Min-ho", "Lee Soo-jin", "Kang Tae-young", "Jung Hye-jin"
]
total_count = 200

# Assign unique account numbers
account_numbers = random.sample(range(100000, 1000000), len(names))
name_to_account = dict(zip(names, account_numbers))

# List of remarks
remarks = [
    "House Rent", "Business Loan", "Investment", "Salary", "Gift", "Utilities",
    "Groceries", "Travel Expenses", "Medical Expenses", "Education Fees",
    "Charity", "Repairs", "Entertainment", "Miscellaneous"
]

# Function to generate random timestamp in 2024
def random_timestamp():
    start = datetime.datetime(2023, 1, 1, 0, 0, 0)
    end = datetime.datetime.now()
    delta = end - start
    random_second = random.randint(0, int(delta.total_seconds()))
    return (start + datetime.timedelta(seconds=random_second)).isoformat() + "Z"

# Function to generate suspicious transaction patterns
def generate_suspicious_transactions():
    suspicious_txs = []
    
    # 1. Structuring pattern (multiple small transactions)
    for _ in range(int(0.02 * total_count)):
        sender = random.choice(names)
        receiver = random.choice([n for n in names if n != sender])
        
        # Generate base time for this pattern
        base_time = datetime.datetime(2024, random.randint(1, 12), random.randint(1, 28))
        
        # Create 4-5 small transactions within a day
        for i in range(random.randint(4, 5)):
            time_offset = random.randint(1, 20) * 3600  # Within 20 hours
            timestamp = (base_time + datetime.timedelta(seconds=time_offset)).isoformat() + "Z"
            
            suspicious_txs.append({
                "senderName": sender,
                "senderAccount": str(name_to_account[sender]),
                "receiverName": receiver,
                "receiverAccount": str(name_to_account[receiver]),
                "remarks": "Payment " + str(i+1),
                "amount": str(random.randint(800, 950)),  # Small amounts
                "timestamp": timestamp,
                "transactionId": "".join(random.choices(string.ascii_letters + string.digits, k=10)),
                "label": "clean"  # Let the server detect it
            })
    
    # 2. Cycle pattern (A->B->C->A)
    for _ in range(int(0.02 * total_count)):
        # Select 3-4 people for a cycle
        cycle_people = random.sample(names, random.randint(3, 4))
        cycle_amount = random.randint(3000, 8000)
        
        # Generate base time
        base_time = datetime.datetime(2024, random.randint(1, 12), random.randint(1, 28))
        
        # Create the cycle
        for i in range(len(cycle_people)):
            sender = cycle_people[i]
            receiver = cycle_people[(i+1) % len(cycle_people)]
            
            # Each transfer happens within days of each other
            time_offset = i * random.randint(12, 36) * 3600  # 12-36 hours apart
            timestamp = (base_time + datetime.timedelta(seconds=time_offset)).isoformat() + "Z"
            
            suspicious_txs.append({
                "senderName": sender,
                "senderAccount": str(name_to_account[sender]),
                "receiverName": receiver,
                "receiverAccount": str(name_to_account[receiver]),
                "remarks": "Investment",
                "amount": str(cycle_amount + random.randint(-500, 500)),
                "timestamp": timestamp,
                "transactionId": "".join(random.choices(string.ascii_letters + string.digits, k=10)),
                "label": "clean"
            })
    
    # 3. High velocity transactions (quick turnaround)
    for _ in range(int(0.02 * total_count)):
        person = random.choice(names)
        sender = random.choice([n for n in names if n != person])
        receiver = random.choice([n for n in names if n != person and n != sender])
        
        # Incoming transaction
        incoming_time = datetime.datetime(2024, random.randint(1, 12), random.randint(1, 28))
        incoming_amount = random.randint(10000, 30000)
        
        suspicious_txs.append({
            "senderName": sender,
            "senderAccount": str(name_to_account[sender]),
            "receiverName": person,
            "receiverAccount": str(name_to_account[person]),
            "remarks": "Deposit",
            "amount": str(incoming_amount),
            "timestamp": incoming_time.isoformat() + "Z",
            "transactionId": "".join(random.choices(string.ascii_letters + string.digits, k=10)),
            "label": "clean"
        })
        
        # Quick outgoing transaction (within an hour)
        time_offset = random.randint(15, 45) * 60  # 15-45 minutes
        outgoing_time = incoming_time + datetime.timedelta(seconds=time_offset)
        
        suspicious_txs.append({
            "senderName": person,
            "senderAccount": str(name_to_account[person]),
            "receiverName": receiver,
            "receiverAccount": str(name_to_account[receiver]),
            "remarks": "Quick Transfer",
            "amount": str(int(incoming_amount * random.uniform(0.8, 0.95))),
            "timestamp": outgoing_time.isoformat() + "Z",
            "transactionId": "".join(random.choices(string.ascii_letters + string.digits, k=10)),
            "label": "clean"
        })
    
    # 4. Large transactions
    for _ in range(int(0.03 * total_count)):
        sender = random.choice(names)
        receiver = random.choice([n for n in names if n != sender])
        
        suspicious_txs.append({
            "senderName": sender,
            "senderAccount": str(name_to_account[sender]),
            "receiverName": receiver,
            "receiverAccount": str(name_to_account[receiver]),
            "remarks": "Large Purchase",
            "amount": str(random.randint(60000, 150000)),  # Above threshold
            "timestamp": random_timestamp(),
            "transactionId": "".join(random.choices(string.ascii_letters + string.digits, k=10)),
            "label": "clean"
        })
    
    # 5. Reciprocal transactions
    for _ in range(int(0.03 * total_count)):
        person1 = random.choice(names)
        person2 = random.choice([n for n in names if n != person1])
        amount = random.randint(5000, 20000)
        
        # First transaction
        base_time = datetime.datetime(2024, random.randint(1, 12), random.randint(1, 28))
        
        suspicious_txs.append({
            "senderName": person1,
            "senderAccount": str(name_to_account[person1]),
            "receiverName": person2,
            "receiverAccount": str(name_to_account[person2]),
            "remarks": "Payment",
            "amount": str(amount),
            "timestamp": base_time.isoformat() + "Z", 
            "transactionId": "".join(random.choices(string.ascii_letters + string.digits, k=10)),
            "label": "clean"
        })
        
        # Reciprocal transaction (within 30 minutes)
        time_offset = random.randint(5, 30) * 60  # 5-30 minutes
        return_amount = amount - random.randint(0, 50)  # Nearly identical amount
        
        suspicious_txs.append({
            "senderName": person2,
            "senderAccount": str(name_to_account[person2]),
            "receiverName": person1,
            "receiverAccount": str(name_to_account[person1]),
            "remarks": "Return Payment",
            "amount": str(return_amount),
            "timestamp": (base_time + datetime.timedelta(seconds=time_offset)).isoformat() + "Z",
            "transactionId": "".join(random.choices(string.ascii_letters + string.digits, k=10)),
            "label": "clean"
        })
    
    return suspicious_txs

# Generate normal transactions (~80%)
normal_count = 0.8 * total_count
normal_transactions = []

for _ in range(int(normal_count)):
    sender_name = random.choice(names)
    receiver_name = random.choice([name for name in names if name != sender_name])
    transaction = {
        "senderName": sender_name,
        "senderAccount": str(name_to_account[sender_name]),
        "receiverName": receiver_name,
        "receiverAccount": str(name_to_account[receiver_name]),
        "remarks": random.choice(remarks),
        "amount": str(random.randint(1000, 45000)),  # Normal range
        "timestamp": random_timestamp(),
        "transactionId": "".join(random.choices(string.ascii_letters + string.digits, k=10)),
        "label": "clean"
    }
    normal_transactions.append(transaction)

# Generate suspicious transactions (~20%)
suspicious_transactions = generate_suspicious_transactions()

# Combine and shuffle all transactions
all_transactions = normal_transactions + suspicious_transactions
random.shuffle(all_transactions)

# Save to JSON file
with open("transactions.json", "w") as f:
    json.dump(all_transactions, f, indent=2)

print(f"Generated {len(normal_transactions)} normal transactions")
print(f"Generated {len(suspicious_transactions)} suspicious transactions")
print(f"Total: {len(all_transactions)} transactions")
print(f"Expected suspicious percentage: {len(suspicious_transactions)/len(all_transactions)*100:.1f}%")