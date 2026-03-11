# 🏥 Hospital Management System — Backend

A RESTful API backend for a Hospital Management System built with **Node.js**, **Express**, **TypeScript**, **Prisma ORM**, and **PostgreSQL**. It supports patient management, employee authentication with JWT, and role-based access control.

---

## 📚 Table of Contents

1. [What This Project Does](#-what-this-project-does)
2. [Tech Stack Explained](#-tech-stack-explained)
3. [Project Architecture](#-project-architecture)
4. [Folder Structure](#-folder-structure)
5. [Database Models](#-database-models)
6. [Prerequisites](#-prerequisites)
7. [Step-by-Step Setup Guide](#-step-by-step-setup-guide)
8. [Environment Variables](#-environment-variables)
9. [Running the Server](#-running-the-server)
10. [API Endpoints](#-api-endpoints)
11. [How Authentication Works](#-how-authentication-works)
12. [Role-Based Access Control](#-role-based-access-control)
13. [Testing with REST Client](#-testing-with-rest-client)
14. [Common Errors & Fixes](#-common-errors--fixes)
15. [What's Next (Planned Features)](#-whats-next-planned-features)

---

## 🎯 What This Project Does

This backend API powers a hospital management system. Right now it can:

- ✅ Register and Login hospital employees (Admin, Doctor, Receptionist)
- ✅ Issue JWT tokens for secure, stateless sessions
- ✅ Protect routes so only logged-in users can access them
- ✅ Restrict certain actions based on the user's role (e.g. only Admins can add patients)
- ✅ Create and fetch patient records from a PostgreSQL database

---

## 🛠 Tech Stack Explained

| Technology | What it does | Why we use it |
|---|---|---|
| **Node.js** | JavaScript runtime that runs our server | Fast, widely used for APIs |
| **Express** | Web framework for Node.js | Makes routing and middleware easy |
| **TypeScript** | JavaScript with types | Catches bugs before they happen |
| **Prisma** | ORM — talks to the database using TypeScript | Avoids writing raw SQL, gives type safety |
| **PostgreSQL** | Relational database | Stores all our data reliably |
| **JWT** | JSON Web Tokens | Secure, stateless user authentication |
| **bcrypt** | Password hashing library | Stores passwords safely (never plain text) |
| **dotenv** | Loads `.env` config files | Keeps secrets out of your code |
| **ts-node-dev** | Runs TypeScript directly & auto-restarts | Faster development (no manual restarts) |

---

## 🏗 Project Architecture

Here is how a request flows through the system from start to finish:

```
Client (e.g. browser, Postman, .http file)
        │
        │  HTTP Request (e.g. POST /api/auth/login)
        ▼
┌───────────────┐
│  Express App  │  ← app.ts  (registers routes & middleware)
└───────┬───────┘
        │
        ▼
┌───────────────────┐
│  Route Layer      │  ← routes/auth.routes.ts, routes/patient.routes.ts
│  (URL matching)   │     Decides which controller handles this request
└───────┬───────────┘
        │
        ▼
┌───────────────────┐
│  Middleware       │  ← middleware/auth.middleware.ts (checks JWT token)
│  (optional gate)  │     middleware/role.middleware.ts (checks user role)
└───────┬───────────┘
        │
        ▼
┌───────────────────┐
│  Controller Layer │  ← controllers/auth.controller.ts, patient.controller.ts
│  (request logic)  │     Reads req.body, calls services, sends response
└───────┬───────────┘
        │
        ▼
┌───────────────────┐
│  Service Layer    │  ← services/auth.service.ts, patient.service.ts
│  (business logic) │     Does the actual work (hashing, querying, etc.)
└───────┬───────────┘
        │
        ▼
┌───────────────────┐
│  Prisma ORM       │  ← src/config/prisma.ts
│  (database calls) │     Translates TypeScript code into SQL queries
└───────┬───────────┘
        │
        ▼
┌───────────────────┐
│  PostgreSQL DB    │  ← hospital_db (your Postgres database)
└───────────────────┘
```

---

## 📁 Folder Structure

```
hospital-backend/
│
├── prisma/
│   └── schema.prisma          # Database models (tables & relationships)
│
├── src/
│   ├── config/
│   │   └── prisma.ts          # Sets up the Prisma database client
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts     # Handles register & login requests
│   │   └── patient.controller.ts  # Handles patient CRUD requests
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts  # Verifies JWT tokens on protected routes
│   │   └── role.middleware.ts  # Checks if user has the required role
│   │
│   ├── routes/
│   │   ├── auth.routes.ts      # /api/auth/register and /api/auth/login
│   │   └── patient.routes.ts   # /api/patients (GET and POST)
│   │
│   ├── services/
│   │   ├── auth.service.ts     # Business logic for auth (hashing, DB queries)
│   │   └── patient.service.ts  # Business logic for patients (DB queries)
│   │
│   ├── app.ts                  # Sets up Express, registers all routes
│   └── server.ts               # Entry point — starts the HTTP server
│
├── .env                        # Secret environment variables (never commit this!)
├── .gitignore
├── package.json
├── prisma.config.ts            # Prisma configuration (schema path, DB URL)
├── test.http                   # REST Client test file for testing all endpoints
└── tsconfig.json               # TypeScript compiler configuration
```

---

## 🗃 Database Models

These are the tables in your PostgreSQL database, defined in `prisma/schema.prisma`.

### `Patient`
| Column | Type | Description |
|---|---|---|
| `id` | String (UUID) | Unique patient identifier |
| `name` | String | Patient's full name |
| `age` | Int | Patient's age |
| `gender` | String | Patient's gender |
| `createdAt` | DateTime | Auto-set when record is created |

### `User` (Hospital Staff)
| Column | Type | Description |
|---|---|---|
| `id` | String (UUID) | Unique user identifier |
| `employeeId` | String | Unique employee ID used for login |
| `name` | String | Staff member's full name |
| `password` | String | Hashed password (never plain text) |
| `role` | Enum | `ADMIN`, `DOCTOR`, or `RECEPTIONIST` |
| `createdAt` | DateTime | Auto-set when record is created |

### `Doctor`
| Column | Type | Description |
|---|---|---|
| `id` | String (UUID) | Unique ID |
| `userId` | String | Links to the `User` model (one-to-one) |
| `departmentId` | String | Links to the `Department` model |
| `specialization` | String | Doctor's area of expertise |
| `experience` | Int | Years of experience |

### `Department`
| Column | Type | Description |
|---|---|---|
| `id` | String (UUID) | Unique ID |
| `name` | String | Department name (e.g. "Cardiology") |

---

## ✅ Prerequisites

Before you start, make sure you have the following installed on your computer:

1. **Node.js** (v18 or above) — [Download here](https://nodejs.org/)
   - To verify: `node -v`
2. **npm** — Comes with Node.js automatically
   - To verify: `npm -v`
3. **PostgreSQL** — [Download here](https://www.postgresql.org/download/)
   - To verify: `psql --version`
4. **Git** (optional, for version control) — [Download here](https://git-scm.com/)
5. **VS Code** (recommended) — [Download here](https://code.visualstudio.com/)
   - Install the **REST Client** extension by Huachao Mao to use the `test.http` file

---

## 🚀 Step-by-Step Setup Guide

Follow these steps exactly. Even if you're a beginner, you can do this!

### Step 1 — Clone or download the project

If using Git:
```bash
git clone <your-repo-url>
cd hospital-backend
```

Or simply open the `hospital-backend` folder in VS Code.

---

### Step 2 — Create your PostgreSQL database

Open your terminal and run:
```bash
psql -U postgres
```

Then inside the PostgreSQL prompt, create the database:
```sql
CREATE DATABASE hospital_db;
\q
```

> **Tip:** `\q` quits the psql prompt and takes you back to your normal terminal.

---

### Step 3 — Set up your environment variables

Create a file called `.env` in the root of `hospital-backend/` with this content:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/hospital_db"
JWT_SECRET="your_super_secret_key_here"
PORT=5000
```

> ⚠️ **IMPORTANT:**
> - Replace `YOUR_PASSWORD` with your actual PostgreSQL password.
> - If your password has special characters (like `@`), they need to be URL-encoded. For example, `@` becomes `%40`.
> - Never commit your `.env` file to GitHub. It's listed in `.gitignore` for this reason.

---

### Step 4 — Install all dependencies

```bash
npm install
```

This reads `package.json` and downloads all the libraries your project needs (Express, Prisma, bcrypt, etc.) into a `node_modules/` folder.

---

### Step 5 — Push your database schema

This command reads your `prisma/schema.prisma` file and creates all the tables in your PostgreSQL database:

```bash
npx prisma db push
```

You should see: `Your database is now in sync with your Prisma schema.`

---

### Step 6 — Generate the Prisma Client

This generates TypeScript types from your schema so your code knows about your models:

```bash
npx prisma generate
```

> **Why do I need to run this?**
> Prisma v7+ requires you to explicitly "generate" the client after any schema change. Think of it as telling TypeScript "hey, go learn about our new database tables."

---

### Step 7 — Start the development server

```bash
npm run dev
```

You should see:
```
Server running on port 5000
```

Your API is now live at `http://localhost:5000` 🎉

---

## 🔑 Environment Variables

| Variable | Example Value | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:pass@localhost:5432/hospital_db` | Full PostgreSQL connection string |
| `JWT_SECRET` | `supersecretkey` | Secret used to sign & verify JWT tokens. Use a long random string in production. |
| `PORT` | `5000` | The port the server listens on |

---

## 🌐 API Endpoints

Base URL: `http://localhost:5000`

### 🔐 Auth Routes — `/api/auth`

#### `POST /api/auth/register`
Register a new hospital employee.

- **Authentication required:** ❌ No
- **Request body:**
```json
{
  "employeeId": "ADM001",
  "name": "Hospital Admin",
  "password": "admin123",
  "role": "ADMIN"
}
```
- **`role` must be one of:** `"ADMIN"`, `"DOCTOR"`, `"RECEPTIONIST"`
- **Success response (200):**
```json
{
  "id": "2c0840e2-aa2a-41c3-824d-2dbd83b5a710",
  "employeeId": "ADM001",
  "name": "Hospital Admin",
  "role": "ADMIN",
  "createdAt": "2026-03-11T18:00:00.000Z"
}
```

---

#### `POST /api/auth/login`
Log in and receive a JWT token.

- **Authentication required:** ❌ No
- **Request body:**
```json
{
  "employeeId": "ADM001",
  "password": "admin123"
}
```
- **Success response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "employeeId": "ADM001",
    "name": "Hospital Admin",
    "role": "ADMIN"
  }
}
```

> **Save the `token` value!** You'll need to include it as a `Bearer` token in all protected requests.

---

### 🏥 Patient Routes — `/api/patients`

#### `GET /api/patients`
Get a list of all patients.

- **Authentication required:** ✅ Yes (JWT token)
- **Allowed roles:** `ADMIN`, `DOCTOR`, `RECEPTIONIST`
- **Headers:**
```
Authorization: Bearer <your_token_here>
```
- **Success response (200):**
```json
[
  {
    "id": "abc123",
    "name": "Rahul Sharma",
    "age": 45,
    "gender": "Male",
    "createdAt": "2026-03-11T18:00:00.000Z"
  }
]
```

---

#### `POST /api/patients`
Add a new patient.

- **Authentication required:** ✅ Yes (JWT token)
- **Allowed roles:** `ADMIN`, `RECEPTIONIST` only
- **Headers:**
```
Authorization: Bearer <your_token_here>
Content-Type: application/json
```
- **Request body:**
```json
{
  "name": "Rahul Sharma",
  "age": 45,
  "gender": "Male"
}
```
- **Success response (200):**
```json
{
  "id": "abc123",
  "name": "Rahul Sharma",
  "age": 45,
  "gender": "Male",
  "createdAt": "2026-03-11T18:00:00.000Z"
}
```

---

## 🔐 How Authentication Works

Here is the exact flow, step by step:

```
1. User sends POST /api/auth/login with { employeeId, password }

2. Server looks up the User in the database by employeeId

3. Server uses bcrypt.compare() to check if the password matches
   the hashed password stored in the DB (we never store plain passwords!)

4. If correct, the server creates a JWT token:
   jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "8h" })
   
   The token contains the user's ID and role, and expires in 8 hours.

5. The token is sent back to the client.

6. For every protected route, the client must send:
   Authorization: Bearer <token>

7. The auth.middleware.ts intercepts the request, extracts the token,
   and verifies it using jwt.verify(token, JWT_SECRET)

8. If valid, the decoded user info is attached to req.user and the
   request continues to the controller.

9. If invalid or missing, the server returns 401 (Unauthorized) or
   403 (Forbidden).
```

---

## 👥 Role-Based Access Control

Different employees have different permissions:

| Route | ADMIN | DOCTOR | RECEPTIONIST |
|---|:---:|:---:|:---:|
| `POST /api/auth/register` | ✅ | ✅ | ✅ |
| `POST /api/auth/login` | ✅ | ✅ | ✅ |
| `GET /api/patients` | ✅ | ✅ | ✅ |
| `POST /api/patients` | ✅ | ❌ | ✅ |

This is enforced by the `role.middleware.ts` file using the `requireRole()` function. For example:

```typescript
// Only ADMIN and RECEPTIONIST can add patients
router.post("/", authenticateToken, requireRole("ADMIN", "RECEPTIONIST"), addPatient)
```

---

## 🧪 Testing with REST Client

The `test.http` file in the project root lets you test all endpoints directly inside VS Code.

### Setup
1. Install the **REST Client** extension in VS Code (by Huachao Mao)
2. Open `test.http`
3. Click **"Send Request"** above any request block

### Workflow for testing protected routes:
1. First, run the **Register** request to create an account
2. Then run the **Login** request — copy the `token` from the response
3. Replace `YOUR_TOKEN_HERE` in the patient requests with your copied token
4. Run the patient requests

---

## 🐛 Common Errors & Fixes

### ❌ `PrismaClient needs to be constructed with a non-empty, valid PrismaClientOptions`
**Why:** Prisma v7+ requires a database driver adapter instead of auto-connecting.
**Fix:** Make sure your `src/config/prisma.ts` uses the `@prisma/adapter-pg` adapter:
```typescript
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })
```

---

### ❌ `Property 'patient' does not exist on type 'PrismaClient'`
**Why:** The Prisma Client hasn't been generated yet (or is outdated after a schema change).
**Fix:** Run:
```bash
npx prisma generate
```

---

### ❌ `File '.../auth.routes.ts' is not a module`
**Why:** The file exists but is completely empty, so TypeScript can't import anything from it.
**Fix:** Make sure all your route/service/controller files have their actual code written inside them. Check with VS Code's file explorer.

---

### ❌ File named `auth.middleware.tsx` instead of `.ts`
**Why:** `.tsx` files are for React (frontend). Backend files must use `.ts`.
**Fix:** Rename the file from `.tsx` to `.ts`. You can do this in your terminal:
```bash
mv src/middleware/auth.middleware.tsx src/middleware/auth.middleware.ts
```

---

### ❌ `Unable to connect to the remote server` (when testing API)
**Why:** The server isn't running.
**Fix:** Make sure `npm run dev` is running in your terminal and shows `Server running on port 5000`.

---

### ❌ Password with special characters in `DATABASE_URL`
**Why:** Characters like `@`, `#`, `$` have special meaning in URLs.
**Fix:** URL-encode them. Common encodings:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`

Example: Password `my@pass` becomes `my%40pass` in the URL.

---

## 🔮 What's Next (Planned Features)

The following features are planned for future development sessions:

- [ ] **Doctor Management** — Create and manage doctor profiles linked to Users
- [ ] **Department Management** — CRUD for hospital departments
- [ ] **Appointment Booking** — Schedule appointments between patients and doctors
- [ ] **Medical Records** — Attach medical history and prescriptions to patients
- [ ] **Admin Dashboard** — Aggregated stats (total patients, appointments per day, etc.)
- [ ] **Pagination** — Return patients in pages instead of all at once
- [ ] **Input Validation** — Validate all request body fields before hitting the database
- [ ] **Error Handling Middleware** — Centralized error handling across all routes
- [ ] **Deployment** — Deploy backend to Render or Railway

---

## 📦 Dependencies Reference

### Production Dependencies
| Package | Version | Purpose |
|---|---|---|
| `express` | ^5.x | Web framework |
| `@prisma/client` | ^7.x | Auto-generated database client |
| `@prisma/adapter-pg` | ^7.x | PostgreSQL driver adapter for Prisma v7 |
| `pg` | ^8.x | Native PostgreSQL driver for Node.js |
| `jsonwebtoken` | ^9.x | Creating and verifying JWT tokens |
| `bcrypt` | ^6.x | Hashing passwords securely |
| `dotenv` | ^17.x | Loading `.env` environment variables |
| `cors` | ^2.x | Allows cross-origin requests (frontend ↔ backend) |

### Dev Dependencies
| Package | Version | Purpose |
|---|---|---|
| `typescript` | ^5.x | TypeScript compiler |
| `ts-node-dev` | ^2.x | Runs TypeScript with auto-restart on save |
| `prisma` | ^7.x | Prisma CLI for migrations and codegen |
| `@types/express` | ^5.x | TypeScript types for Express |
| `@types/node` | ^25.x | TypeScript types for Node.js builtins |
| `@types/jsonwebtoken` | ^9.x | TypeScript types for jsonwebtoken |
| `@types/bcrypt` | ^6.x | TypeScript types for bcrypt |
| `@types/pg` | ^8.x | TypeScript types for pg |

---

*Built with ❤️ — Hospital Management System Backend*
