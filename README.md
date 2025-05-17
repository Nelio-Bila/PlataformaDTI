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
We welcome contributions to the Hospital IT Asset Tracker! This section provides guidelines to help you contribute effectively.

#### Getting Started
1. the repository

 - Click the "Fork" button at the top right of the repository page on GitHub
 - This creates a copy of the repository in your GitHub account
2. Clone your fork locally

3. Set up development environment
    ```bash
    # Install dependencies
    pnpm install

    # Create .env file from example
    cp example.env .env

    # Configure your database connection in .env

    # Initialize database
    pnpm dlx prisma migrate dev
    pnpm dlx prisma db seed
    ```

#### Development Workflow
1. Create a feature branch
    ```bash
    git checkout -b feature/your-feature-name
    # or
    git checkout -b fix/issue-you-are-fixing
    ```

2. Make your changes
    - Write clean, well-commented code
    - Follow existing code style and project structure
    - Update or add tests for your changes

3. Test your changes locally
    ```bash
    # Run linting
    pnpm lint

    # Start development server
    pnpm dev
    ```

4. Commit your changes
    ```bash
    git add .
    git commit -m "Description of changes"
    ```

Follow these guidelines for commit messages:

 - Use present tense ("Add feature" not "Added feature")
 - First line should be a clear summary
 - Reference issue numbers if applicable: "Fix #123: Add user profile page"

#### Pull Request Process
1. Push changes to your fork
    ```bash
    git push origin feature/your-feature-name
    ```

2. Create a pull request

    - Go to the original repository on GitHub
    - Click "New pull request"
    - Select your fork and branch
    - Fill in the PR template with details about your changes

3. Code review process

    - Maintainers will review your code
    - Address any feedback or requested changes
    - Once approved, your PR will be merged


#### Reporting Issues
1. Check existing issues to avoid duplicates
    - Create a new issue with:
    - Clear, descriptive title
    - Detailed reproduction steps for bugs
    - Expected behavior and actual behavior
    - Screenshots if applicable
    - Environment information (browser, OS, etc.)


#### Code Style Guidelines
    - Follow the project's ESLint and Prettier configurations
    - Use TypeScript types appropriately
    - Keep components modular and reusable
    - Comment complex logic
    - Follow the existing project structure

#### Documentation
    - Update the README.md for any user-facing changes
    - Add JSDoc comments for new functions and components
    - Update API documentation for any endpoint changes

#### Database Changes
    - For schema changes, create appropriate Prisma migrations
    - Test migrations both up and down to ensure they work correctly
    - Update relevant seed data if necessary

Thank you for contributing to making PlataformaDTI better!