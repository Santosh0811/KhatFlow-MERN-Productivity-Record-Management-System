# 📒 KhatFlow — MERN Productivity & Record Management System

![MERN](https://img.shields.io/badge/MERN-Stack-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-Backend-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Runtime-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-MongoDB%20ODM-880000?style=for-the-badge&logo=mongoose&logoColor=white)

## 📌 About KhatFlow

**KhatFlow** is a full-stack **MERN application** that brings multiple everyday record-management tools together in one platform.

The application consists of four major modules:

- ✅ **Todo** — Manage events, schedules, tasks, and their status.
- 📖 **Khata** — Maintain ledger-style records with quantities, rates, descriptions, and amounts.
- 💰 **Account** — Track deposits, withdrawals, balances, and transaction history.
- 🛒 **Grocery Notes** — Create grocery lists with quantities, units, rates, and calculated totals.

KhatFlow is designed as a practical application for managing personal tasks, financial records, ledger information, and grocery planning through a unified MERN-based system.

---

## ✨ Main Modules

### ✅ 1. Todo

The Todo module allows users to organize events and tasks based on dates and time.

Each Todo record can contain:

- Event name
- Date
- Start time
- End time
- Description
- Task status

### 📖 2. Khata

The Khata module provides a ledger-style structure for maintaining records.

Each Khata can contain:

- Title
- Date
- Description
- Quantity
- Unit
- Rate
- Amount

This structure can be used for maintaining itemized ledger or transaction records.

### 💰 3. Account

The Account module provides a simple account-management system.

It tracks:

- Account name
- Total withdrawal
- Total deposit
- Current balance
- Transaction history

Each transaction contains:

- Date & time
- Details
- Amount
- Transaction type
  - `Deposit`
  - `Withdrawl`

> **Note:** The transaction type follows the spelling used in the current schema: `Withdrawl`.

### 🛒 4. Grocery Notes

The Grocery Notes module allows users to create grocery lists and maintain item-level information.

Each grocery note contains:

- Title
- Total amount
- Item name
- Quantity
- Unit
- Unit name
- Rate

This provides a structured way to record grocery requirements and their associated costs.

---

# 🔐 Authentication & User Management

KhatFlow includes a user authentication model with support for:

- Unique user ID
- Username
- Unique email
- Password
- OTP
- OTP expiration
- Email validation
- User verification
- Admin role

The user ID is generated using UUID.

Passwords are configured with:

```js
select: false
```

which prevents the password field from being returned by default in Mongoose queries.

---

# 🗃️ Database Structure

KhatFlow uses **MongoDB** with **Mongoose** for database modeling.

The main collections/models are:

```text
Signup
TodoForm
KhataLedger
Account
GroceryNote
```

### User

```text
Signup
│
├── userId
├── userName
├── email
├── password
├── otp
├── otpExpireAt
├── isAdmin
└── isVerified
```

### Todo

```text
TodoForm
│
├── userId
├── userName
├── email
├── eventName
├── date
└── todoContent[]
    ├── startTime
    ├── endTime
    ├── description
    └── status
```

### Khata

```text
KhataLedger
│
├── userId
├── userName
├── email
├── title
├── date
└── rows[]
    ├── description
    ├── qty
    ├── unit
    ├── rate
    └── amount
```

### Account

```text
Account
│
├── userId
├── userName
├── email
├── name
├── withdrawl
├── deposit
├── balance
└── formRows[]
    ├── datetime
    ├── details
    ├── amount
    └── type
```

### Grocery

```text
GroceryNote
│
├── userId
├── userName
├── email
├── title
├── total
└── items[]
    ├── name
    ├── qty
    ├── unit
    ├── unitName
    └── rate
```

---

# 🏗️ Application Architecture

```text
                    ┌─────────────────────┐
                    │      React.js       │
                    │     Frontend UI     │
                    └──────────┬──────────┘
                               │
                               │ HTTP Requests
                               ▼
                    ┌─────────────────────┐
                    │     Express.js      │
                    │      REST API       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       Node.js       │
                    │    Backend Logic    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      Mongoose       │
                    │     ODM Layer       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      MongoDB        │
                    │      Database       │
                    └─────────────────────┘
```

---

# 🧰 Tech Stack

## Frontend

- React.js
- JavaScript
- HTML5
- CSS
- React-based UI components

## Backend

- Node.js
- Express.js
- REST APIs
- JavaScript

## Database

- MongoDB
- Mongoose

## Authentication

- UUID-based user identification
- OTP verification
- Email validation
- User verification
- Admin role support

---

# 📂 Suggested Project Structure

```text
KhatFlow/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── models/
│   │   ├── account.js
│   │   ├── grocery.js
│   │   ├── khata.js
│   │   ├── signup.js
│   │   └── todo.js
│   │
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── config/
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

> Adjust the folder names above according to your actual project structure.

---

# ⚙️ Getting Started

## 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
```

Navigate into the project:

```bash
cd KhatFlow
```

---

## 2. Install Backend Dependencies

```bash
cd backend
npm install
```

---

## 3. Configure Environment Variables

Create a `.env` file inside the backend directory.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

Add any additional environment variables required by your authentication, OTP, email, or application configuration.

---

## 4. Start Backend

```bash
npm start
```

Or, if your project uses a development script:

```bash
npm run dev
```

---

## 5. Install Frontend Dependencies

Open another terminal:

```bash
cd frontend
npm install
```

Start the frontend:

```bash
npm start
```

---

# 🔄 Core Data Relationship

Each major application module associates its records with a user through:

```text
userId
userName
email
```

Conceptually:

```text
                    User
                     │
          ┌──────────┼──────────┐
          │          │          │
          ▼          ▼          ▼
        Todo       Khata      Account
          │          │          │
          └──────────┼──────────┘
                     │
                     ▼
               Grocery Notes
```

This allows the application to organize different types of records around the authenticated user.

---

# 📊 Module Comparison

| Module | Purpose | Main Records |
|---|---|---|
| ✅ Todo | Task & schedule management | Events, tasks, time, status |
| 📖 Khata | Ledger management | Items, quantity, rate, amount |
| 💰 Account | Financial tracking | Deposits, withdrawals, balance |
| 🛒 Grocery | Grocery planning | Items, quantity, units, rates |

---

# 🔒 Security & Data Handling

The current data models include several validation and data-handling mechanisms:

- Unique user IDs
- Unique email addresses
- Required fields
- String trimming
- Lowercase email storage
- Minimum username length
- Minimum password length
- Email format validation
- OTP support
- OTP expiration field
- User verification status
- Admin role support
- Password hidden from default Mongoose queries using `select: false`

Example:

```js
password: {
    type: String,
    required: true,
    minlength: 6,
    select: false,
}
```

> Password hashing/encryption is not specified in the provided schemas. If password hashing is implemented elsewhere in the backend, document that implementation separately.

---

# 🎯 Project Goals

KhatFlow combines multiple everyday utilities into one full-stack application.

The project demonstrates practical implementation of:

- MERN stack development
- MongoDB data modeling
- Mongoose schemas
- Nested MongoDB documents
- REST API development
- User authentication
- OTP verification
- User-specific data management
- Financial record management
- Ledger management
- Task management
- Grocery management
- Role-based user concepts

---

# 🚀 Future Improvements

Potential future improvements include:

- 📱 Responsive mobile-first interface
- 📊 Dashboard analytics
- 📈 Account transaction charts
- 🔍 Advanced search and filtering
- 🗂️ Categories for Khata records
- 🛒 Grocery item templates
- 📅 Calendar-based Todo management
- 🔔 Task reminders
- 📤 Export records to PDF/CSV
- ☁️ Cloud deployment
- 🔐 Password hashing and stronger authentication
- 🔑 JWT/session-based authentication improvements
- 🛡️ Rate limiting and additional API security

---

# 🧪 Development Focus

KhatFlow is built as a practical MERN project demonstrating how multiple application concepts can coexist within a single full-stack system.

Instead of building only one CRUD feature, the application combines:

```text
Todo
  +
Khata
  +
Account
  +
Grocery Notes
  +
Authentication
  =
KhatFlow
```

---

# 👨‍💻 Developer

**Software Engineer 😎**

Full-Stack Developer focused on building practical web applications using **MERN Stack, Blockchain, and modern web technologies**.

---

# ⭐ Support

If you find this project useful or interesting, consider giving the repository a ⭐ on GitHub.

---

## 📜 License

Add your preferred license here, such as MIT License.