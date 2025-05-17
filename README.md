# Hospital IT Asset Tracker

A comprehensive IT asset management system designed for healthcare facilities to track equipment, manage requisitions, and organize IT assets across departments.

## Overview

This application helps IT departments in healthcare settings efficiently manage their equipment inventory, track assets across different organizational units, handle equipment requisitions, and maintain detailed records of IT infrastructure.

## Key Features

- **Complete Equipment Management**
  - Track IT assets with detailed information (serial number, brand, model, status)
  - Custom fields via JSON storage for flexible attributes
  - Equipment observations and notes tracking
  - Equipment images with Cloudinary integration
  - Warranty and purchase date tracking

- **Organizational Structure**
  - Multi-level organizational mapping (Direction → Department → Service → Sector → Repartition)
  - Location-based asset assignment and tracking

- **Request System**
  - Equipment requisition workflow
  - Request status tracking with enum types
  - Approval processes

- **User Management**
  - Role-based access control
  - Permission groups
  - Authentication with NextAuth

## Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **UI Components**: shadcn/ui (based on Radix UI)
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth
- **Image Storage**: Cloudinary
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: Zustand, TanStack Query

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Nelio-Bila/PlataformaDTI
   cd PlataformaDTI
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create a .env file based on the example.env: 

    DATABASE_URL="postgresql://postgres:your_password@localhost:5432/dti_db?schema=public"
    NEXTAUTH_SECRET="your-secret-here"
    AUTH_SECRET="your-auth-secret-here"
    CLOUDINARY_CLOUD_NAME="your-cloud-name"
    CLOUDINARY_API_KEY="your-api-key"
    CLOUDINARY_API_SECRET="your-api-secret"

4. Initialize the database:
    ```bash
    pnpm dlx prisma migrate dev
    pnpm dlx prisma db seed
    ```

5. Run the development server:
    ```bash
    pnpm dev
    ```

6. Open http://localhost:3000 with your browser.

### Database Schema
The database is structured around these main entities:

 - **Equipment**: Core asset tracking with customizable fields
 - **Organizational Units**: Direction, Department, Service, Sector, Repartition
 - **Users & Permissions**: Role-based access control system
 - **Requests**: Asset requisition and movement tracking

### Deployment
The application can be deployed on Vercel or any platform supporting Next.js applications:
    ```bash
    pnpm build
    pnpm start
    ```

### License
This project is licensed under the MIT License - see the LICENSE file for details.

### Acknowledgements
 - Built with Next.js
 - UI components from shadcn/ui
 - Database ORM by Prisma


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
```