# Money Map Application

A simple money transfer application that allows users to send virtual money and keep track of transactions.

## Features

- Send money between accounts
- Generate unique transaction IDs
- Store transaction history

## Prerequisites

- Node.js (14.x or higher)
- npm or yarn

## Installation

1. Clone the repository (if you haven't already)
2. Navigate to the project directory:

3. Install dependencies:

```bash
npm install
```

## Running the Application

### Step 1: Start the Backend Server

The backend server handles transaction storage and processing.

```bash
npm run server
```

This will start the Express server at http://localhost:5001.

You should see the following message in your terminal:

```
Server is running on http://localhost:5001
```

### Step 2: Start the Frontend Application

In a new terminal window, run:

```bash
npm start
```

This will start the React application and open it in your default browser at http://localhost:3000 (or another port if 3000 is already in use).

## How It Works

1. The frontend application provides a form to enter transaction details
2. When you submit the form, the data is sent to the backend server
3. The backend server saves the transaction data to a JSON file
4. A unique transaction ID is generated for each transaction

## Data Storage

All transactions are stored in a JSON file located at:

```
/Users/ankitpokhrel/Desktop/money_map/transactions.json
```

This file is automatically created the first time you submit a transaction.

## Development

- Frontend: React with Material-UI
- Backend: Express.js
- Data Storage: JSON file
