# SmartTicket Event System

SmartTicket is a comprehensive web-based platform designed to democratize event management. It enables organizers to create events, manage ticket sales, and validate attendees using secure QR codes. For attendees, it offers a seamless booking experience with instant digital ticket delivery.

![SmartTicket Dashboard Preview](public/dashboard-preview.png)
*(Note: Add a screenshot of your dashboard here)*

## 🚀 Features

### For Functionality
- **Event Management**: Create, edit, and manage events with details like location, price, capacity, and imagery.
- **Secure Ticketing**: Generate unique, cryptographically signed QR codes for each ticket to prevent fraud.
- **Instant Delivery**: Automated email delivery of tickets upon successful payment.
- **QR Code Scanning**: Built-in scanning interface for organizers to validate tickets at the venue in real-time.
- **Guest Checkout**: Purchase tickets without forcing account creation.

### For Organizers
- **Dashboard**: Real-time insights on revenue, tickets sold, and recent transactions.
- **Subscription Models**: Monthly and Yearly subscription plans with a 14-day free trial.
- **Scanner App**: dedicated route for checking in attendees.

### Technical Highlights
- **Role-Based Access Control**: Distinct roles for Users, Organizers, and Admins.
- **Payment Integration**: Seamless payments with **Paystack**.
- **Modern UI/UX**: Built with **Next.js 15**, **Tailwind CSS**, and **Framer Motion** for a premium feel.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn/ui](https://ui.shadcn.com/)
- **Payments**: [Paystack](https://paystack.com/)
- **Email**: [Resend](https://resend.com/)

## 🏁 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [PostgreSQL](https://www.postgresql.org/) database (Local or hosted like Supabase/Neon)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/eventplanner.git
    cd eventplanner
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory and add the following variables:

    ```env
    # Database
    DATABASE_URL="postgresql://user:password@localhost:5432/eventplanner?schema=public"

    # Authentication (NextAuth)
    NEXTAUTH_URL="http://localhost:3000"
    NEXTAUTH_SECRET="your-super-secret-key-run-openssl-rand-base64-32"

    # Payments (Paystack)
    NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_test_..."
    PAYSTACK_SECRET_KEY="sk_test_..."

    # Email (Resend)
    RESEND_API_KEY="re_..."

    # App Base URL
    NEXT_PUBLIC_APP_URL="http://localhost:3000"
    ```

4.  **Database Setup**
    Initialize the database using Prisma:

    ```bash
    npx prisma migrate dev --name init
    npx prisma db seed # If you have a seed script
    ```

5.  **Run the Development Server**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📂 Project Structure

```
├── app/                  # Next.js App Router pages and API routes
│   ├── (auth)/           # Authentication routes (login, register)
│   ├── (marketing)/      # Public facing pages (landing, about)
│   ├── api/              # Backend API routes
│   └── dashboard/        # Protected organizer/user dashboard
├── components/           # Reusable UI components
│   ├── ui/               # Shadcn UI primitives
│   └── ...               # Feature-specific components
├── lib/                  # Utility functions and shared logic
├── prisma/               # Database schema and migrations
└── public/               # Static assets
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
