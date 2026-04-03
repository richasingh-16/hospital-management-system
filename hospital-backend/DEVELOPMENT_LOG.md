# 📓 Development Log & Architecture Decisions

This document serves as a chronological log of what we have built so far in the Hospital Management Backend, along with the reasoning behind the technical choices we made.

---

## 1. Initial Database Setup & Troubleshooting

### **What we did:**
- Set up **PostgreSQL** locally to store hospital data.
- Initialized **Prisma ORM** (`npm install @prisma/client` and `prisma`) to act as the bridge between our TypeScript code and the SQL database.
- Fixed a major Prisma v7 connection error (`PrismaClientInitializationError`).

### **Why we did it:** 
- **PostgreSQL** is robust and reliable for complex relationships (like mapping Doctors to Departments and Patients).
- **Prisma** prevents us from manually writing buggy SQL commands and ensures our database models have strict TypeScript definitions.
- Prisma v7 recently transitioned to a "Driver Adapters" architecture. To ensure connection stability, we explicitly installed the `pg` node package and `@prisma/adapter-pg` to properly initialize the database pool in `src/config/prisma.ts`.

---

## 2. Database Schema Modeling

### **What we did:**
- Created four primary models in `schema.prisma`:
  1. `User`: Core authentication model (with `employeeId`, hashed `password`, and enum `Role` separating `ADMIN`, `DOCTOR`, and `RECEPTIONIST`).
  2. `Patient`: Stores basic patient demographics.
  3. `Doctor`: Stores doctor specific info (`specialization`, `experience`) and ties directly to a `User`.
  4. `Department`: Groups multiple doctors together.
- Pushed the models to Postgres using `npx prisma db push`.
- Regenerated TypeScript types with `npx prisma generate`.

### **Why we did it:** 
- Separating the `User` table (auth/credentials) from the `Doctor` table (medical specifics) allows multiple different types of staff to share a single, unified login system while retaining their specific profiles. 
- Using Prisma `enum` for Roles makes it impossible to accidentally assign a user an invalid role string.

---

## 3. The Core API Architecture (Service-Controller-Route)

### **What we did:**
- Scaffolded Express on a Node.js server using `ts-node-dev`.
- Split logic into 3 distinct layers:
  1. **Routes** (`auth.routes.ts`, `patient.routes.ts`): Define the URLs.
  2. **Controllers** (`auth.controller.ts`, `patient.controller.ts`): Read incoming HTTP requests (`req.body`) and send back JSON responses (`res.json`).
  3. **Services** (`auth.service.ts`, `patient.service.ts`): Contain the heavy lifting/business logic (database queries via Prisma).

### **Why we did it:** 
- This standard pattern keeps code immensely clean, readable, and highly maintainable. If we ever need to swap databases or add testing, we only touch the Service layer, without needing to break the HTTP Controller layer.

---

## 4. Authentication & Security (JWT + Bcrypt)

### **What we did:**
- Installed `bcrypt` and `jsonwebtoken`.
- Implemented `POST /api/auth/register`: Hashes passwords.
- Implemented `POST /api/auth/login`: Checks passwords and issues an 8-hour JWT (JSON Web Token) containing the `userId` and `role`.

### **Why we did it:**
- **Bcrypt** protects against database breaches. By salting and hashing `password` before saving, the real passwords are unreadable even to database administrators.
- **JWT** allows our API to remain "stateless". We don't have to keep a database of logged-in sessions. Instead, the user simply holds onto the assigned token and presents it as proof of identity on future requests.

---

## 5. Express Middleware (Guarding Endpoints)

### **What we did:**
- Created `auth.middleware.ts`: Parses the `Authorization: Bearer <token>` header, verifies it with the secret key, and attaches the user's decoded payload to the `req` object.
- Created `role.middleware.ts`: Intercepts the request and checks if `req.user.role` matches an array of allowed roles (e.g., `['ADMIN', 'DOCTOR']`).
- Fixed a critical compile bug where `auth.middleware.tsx` was saved as a React file instead of a TypeScript `.ts` backend file.

### **Why we did it:** 
- Middleware is the best way to secure an API. Without role checking, any logged-in receptionist could forcefully execute endpoints meant only for high-level admins. These files intercept malicious requests instantly.

---

## 6. GitHub Tracking & Secret Management

### **What we did:**
- Set up an extensive `.gitignore` to omit `node_modules`, standard Node caches, and `.env` files.
- Purged `test.http` from GitHub's internal tracking via `git rm --cached`.

### **Why we did it:**
- `.env` holds the `DATABASE_URL` and `JWT_SECRET`. Exposing it to GitHub could result in the complete takeover of the hospital database. 
- `test.http` contained hardcoded API JWT tokens we used for testing. While they expire, it acts as a safeguard preventing our testing credentials from being publicly uploaded to the repository.

---

## 7. Hospital Ward & Bed Infrastructure

### **What we did:**
- Created the `Ward` and `Bed` models in Prisma, utilizing a one-to-many relationship (One Ward has multiple Beds).
- Configured a `BedStatus` enum (`AVAILABLE`, `OCCUPIED`, `MAINTENANCE`) to strictly enforce bed availability tracking.
- Scaffolded out the `src/modules/wards/` and `src/modules/beds/` folders, with respective separated Services, Controllers, and Routes.
- Registered these new components directly to our main `app.ts` (`/api/wards`, `/api/beds`).

### **Why we did it:**
- An actual hospital relies heavily on infrastructure. We needed a way to map the real-world concept of large Wards (like ICU, General) down to the finite resource of single physical Beds.
- Implementing the `BedStatus` enum directly sets the foundation for our upcoming Admissions logic. Without accurate availability tracking, the system wouldn't know when to mathematically block admitting a new patient if an entire ward is full.

---

## 8. Admissions Module (The Core Hospital Workflow)

### **What we did:**
- Added the `Admission` model to Prisma, creating a relational bridge between `Patient`, `Doctor`, and `Bed`.
- Updated the inverse relations (`admissions Admission[]`) inside the respective models to ensure Prisma parses the foreign keys properly.
- Built the Admissions Service, Controller, and Routes.
- Specifically injected state-change business logic: when an admission is created, it verifies the target Bed is `AVAILABLE`. If it is, the system explicitly mutates that `BedStatus` to `OCCUPIED`.

### **Why we did it:**
- This marks the transition from standard "CRUD" (Create/Read) APIs into **real business logic workflows**.
- A hospital isn't just about reading lists of patients; it's about the lifecycle of resources. By tying the Admission heavily to the Bed Status, your frontend dashboards can accurately project bed shortages and alert receptionists dynamically.

---

## 9. Dashboard Statistics API

### **What we did:**
- Built the `GET /api/dashboard/admin` endpoint to serve high-level aggregated numbers required by the React frontend.
- Utilized `Promise.all` across multiple `prisma.X.count()` calls to fetch data concurrently from Postgres for maximum speed.
- Filtered specifically for the number of *Admissions today*, and separated Bed statuses explicitly by `"AVAILABLE"` and `"OCCUPIED"`.

### **Why we did it:**
- Instead of hitting 5 different API endpoints on the frontend to calculate totals piecemeal, an aggregated backend stat route ensures the frontend dashboard instantly loads total patients, beds, and admission stats in a single, perfectly structured JSON response payload. It's much, much faster.

---

## Current Status Overview
All backend foundation logic is 100% operational, secure, and separated into modular layers. We mapped the hierarchy from Departments ➔ Wards ➔ Beds ➔ Admissions, and successfully established aggregated business logic for Dashboard queries.
