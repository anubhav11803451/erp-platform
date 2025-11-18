# Educational ERP Platform

A full-stack, modular Enterprise Resource Planning (ERP) system designed for educational institutions. This project is structured as a pnpm monorepo and features a NestJS backend, a React frontend, and a shared Prisma package to ensure end-to-end type safety.

## About The Project

The goal of this project is to create a flexible, cloud-native SaaS platform that can cater to a diverse range of educational institutions, from small tuition centers to large-scale K-12 schools and coaching institutes.

The core architecture is built on a modular design, allowing features to be packaged into different product tiers ("Tuition Lite", "School ERP", etc.) to meet specific needs and budgets.

### Key Features (Tier 1 MVP)

*   **Student Management**: Add, view, edit, and manage student profiles.
*   **Batch Management**: Create custom batches (e.g., "10th CBSE Maths") and enroll students.
*   **Fee Collection**: Log payments and track fee dues for each student.
*   **Attendance Tracking**: Mark and view attendance for each batch.

## Built With

*   **Monorepo**: [pnpm](https://pnpm.io/) Workspaces
*   **Backend**: [NestJS](https://nestjs.com/), [Prisma](https://www.prisma.io/)
*   **Frontend**: [React](https://react.dev/), [Vite](https://vitejs.dev/), [Redux Toolkit](https://redux-toolkit.js.org/), [shadcn/ui](https://ui.shadcn.com/)
*   **Database**: [PostgreSQL](https://www.postgresql.org/)
*   **Shared Types**: A dedicated `@erp/db` package ensures type safety between the frontend and backend.

## Project Structure

The monorepo is organized into `apps` and `packages`:

```
/
├── apps/
│   ├── backend/      # NestJS application
│   └── frontend/     # React (Vite) application
│
└── packages/
    ├── db/           # Shared Prisma schema, client, and types
    ├── eslint-config/  # Shared ESLint configurations
    └── tsconfig-base/  # Shared TypeScript configurations
```

## Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites

*   Node.js (v20.0.0 or higher)
*   pnpm (v8.0.0 or higher)
*   Docker (for running a local PostgreSQL instance)

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone <your-repo-url>
    cd erp-monorepo
    ```

2.  **Install dependencies** from the root of the project:
    ```sh
    pnpm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root directory. You can copy the example file if one exists.
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/erp_db?schema=public"
    ```

4.  **Run database migrations:**
    This command runs the `db:migrate` script defined in the `packages/db` package.
    ```sh
    pnpm db:migrate
    ```

5.  **Run the development servers:**
    This will start both the backend and frontend applications concurrently.
    ```sh
    pnpm dev
    ```
    *   Backend will be available at `http://localhost:3000`
    *   Frontend will be available at `http://localhost:5173`


