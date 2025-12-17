# Product Requirement Document (PRD): SmartTicket Event System

| Metadata | Details |
| :--- | :--- |
| **Project Name** | SmartTicket (Event Booking & QR Entry) |
| **Version** | 1.0 |
| **Status** | Draft / Ready for Development |
| **Last Updated** | December 16, 2025 |
| **Tech Stack** | Next.js 14+ (App Router), PostgreSQL, Prisma, Paystack |

---

## 1. Executive Summary
**SmartTicket** is a web-based platform designed to democratize event management. It allows organizers to create events and sell tickets securely, while providing attendees with instant QR-code-based digital tickets. The system integrates **Paystack** for seamless payments across Africa and utilizes **PostgreSQL** for robust data consistency.

## 2. Project Objectives
* **Simplicity:** Create an event in under 2 minutes.
* **Security:** Prevent ticket fraud using signed digital signatures in QR codes.
* **Automation:** Instant ticket delivery via email upon successful payment confirmation via Webhook.
* **Speed:** Real-time validation of tickets at the door (scanning latency < 1s).

## 3. User Personas
1.  **Organizer:** Creates events, monitors sales dashboard, scans tickets at the venue.
2.  **Attendee:** Browses events, purchases tickets via Paystack, manages ticket history.
3.  **Platform Admin:** (Future Scope) Manages users and payouts.

## 4. Technical Architecture
* **Frontend:** Next.js 14+ (React Server Components, Tailwind CSS).
* **Backend:** Next.js API Routes / Server Actions.
* **Database:** PostgreSQL (Hosted on Supabase, Neon, or Azure).
* **ORM:** Prisma.
* **Payment Gateway:** Paystack API (Standard Checkout + Webhooks).
* **Email Service:** Resend or Nodemailer (SMTP).

---

## 5. Functional Requirements

### 5.1 Authentication & Profile
* **FR-01:** Users must be able to sign up/login using Email/Password or Google (NextAuth.js).
* **FR-02:** System must distinguish between `USER` and `ORGANIZER` roles (or allow a single user to act as both).

### 5.2 Event Management (Organizer)
* **FR-03:** Organizer can create an event with: Title, Description, Banner Image, Date, Time, Venue, Ticket Price, and Stock Quantity.
* **FR-04:** Organizer can view a dashboard showing: Total Revenue, Tickets Sold, and Recent Transactions.

### 5.3 Booking & Payment Flow
* **FR-05:** User selects ticket quantity. System calculates total price.
* **FR-06:** System initializes a transaction with Paystack API.
* **FR-07:** **Critical:** System must expose a `POST /api/webhooks/paystack` endpoint to listen for the `charge.success` event.
* **FR-08:** Tickets are *only* generated in the database after the webhook confirms payment signature validation.

### 5.4 Ticket & QR Generation
* **FR-09:** Successful booking generates a unique Ticket ID.
* **FR-10:** System generates a QR code string containing a signed payload (e.g., `ticketId + secretSalt`) to prevent users from generating their own QR codes.
* **FR-11:** User receives an email receipt with the QR code attached.

### 5.5 Check-In & Scanning
* **FR-12:** Organizer accesses a private route `/admin/scan` (protected).
* **FR-13:** Organizer grants camera access to scan attendee QR codes.
* **FR-14:** System validates:
    1.  Does ticket exist?
    2.  Is status `UNUSED`?
    3.  Does ticket belong to the current event?
* **FR-15:** On success, system updates ticket status to `USED` and displays "Access Granted".
* **FR-16:** On failure (or if already used), displays "Access Denied".

---

## 6. Database Schema (Prisma)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  USER
  ORGANIZER
  ADMIN
}

enum TicketStatus {
  PENDING
  PAID
  USED
  REFUNDED
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  password      String?   // Hashed
  role          Role      @default(USER)
  createdAt     DateTime  @default(now())
  
  events        Event[]   // Events created by this user
  tickets       Ticket[]  // Tickets bought by this user
}

model Event {
  id            String    @id @default(cuid())
  title         String
  description   String    @db.Text
  date          DateTime
  location      String
  price         Decimal   @db.Decimal(10, 2)
  capacity      Int
  soldCount     Int       @default(0)
  organizerId   String
  organizer     User      @relation(fields: [organizerId], references: [id])
  tickets       Ticket[]
  createdAt     DateTime  @default(now())
}

model Ticket {
  id            String       @id @default(cuid())
  userId        String
  eventId       String
  reference     String       @unique // Paystack transaction reference
  status        TicketStatus @default(PENDING)
  qrCodeToken   String?      @unique // Generated after payment
  user          User         @relation(fields: [userId], references: [id])
  event         Event        @relation(fields: [eventId], references: [id])
  purchasedAt   DateTime     @default(now())
  
  @@index([eventId, status])
}