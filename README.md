# Device Registration — SEDCON / PROCON-RJ

An internal device inventory and management system built for the **SEDCON** team at **PROCON-RJ**.

The goal of this project is to centralize control over the IT equipment inventory (computers, phones, switches, printers, and security appliances), making it easy to see which devices are assigned to staff, which are unassigned, and which are broken.

## Features

- Create, edit, and delete devices
- Assign staff members to each device (with inline editing)
- Filter by category, assignment status, and broken devices
- Search by name, MAC address, serial number, or assigned staff member
- Export the inventory to Excel (.xlsx)
- Simple username/password authentication
- Light/dark theme support

## Tech Stack

**Backend**
- Java 17
- Spring Boot 3.2.5
- Spring Data JPA / Hibernate
- Spring Security (HTTP Basic authentication)
- PostgreSQL
- Maven

**Frontend**
- React + TypeScript
- Vite
- TanStack Query (React Query)
- Tailwind CSS + shadcn/ui
- React Hook Form + Zod
- wouter (routing)
- SheetJS (Excel export)

## Prerequisites

Before running the project, make sure you have installed:

- [Java 17 (JDK)](https://adoptium.net/)
- [Maven](https://maven.apache.org/download.cgi)
- [Node.js](https://nodejs.org/) (version 18 or higher)
- [PostgreSQL](https://www.postgresql.org/download/)

## How to Run the Project

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/device-registration.git
cd device-registration
```

### 2. Set up the database

Create a local PostgreSQL database (the project expects the name `pcregister` by default):

```sql
CREATE DATABASE pcregister;
```

### 3. Configure backend environment variables

Copy the example file and fill it in with your real credentials:

```bash
cd backend/src/main/resources
cp application.properties.example application.properties
```

Edit `application.properties` with:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/pcregister
spring.datasource.username=postgres
spring.datasource.password=YOUR_DATABASE_PASSWORD

app.user.guilherme.password=YOUR_LOGIN_PASSWORD
app.user.supervisor.password=SUPERVISOR_PASSWORD
```

> ⚠️ This file is **not committed to the repository** (it's listed in `.gitignore`), since it contains sensitive credentials.

### 4. Run the backend

```bash
cd backend
mvn spring-boot:run
```

The backend runs by default at `http://localhost:8080`.

### 5. Run the frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs by default at `http://localhost:5173`.

### 6. Access the application

Open your browser at `http://localhost:5173` and log in with one of the users configured in step 3.

## Project Structure

```
device-registration/
├── backend/          # Spring Boot API
│   └── src/main/java/com/pcregister/
│       ├── config/       # Security configuration
│       ├── controller/   # REST endpoints
│       ├── model/        # JPA entities
│       ├── repository/   # Spring Data repositories
│       └── service/       # Business logic
└── frontend/         # React application
    └── src/
        ├── components/   # UI components
        ├── contexts/      # Authentication context
        ├── pages/         # Application pages
        └── lib/           # Utilities and schemas
```

## Author

Developed by **Guilherme**, member of the **SEDCON / PROCON-RJ** team, with the goal of streamlining the organization and tracking of the institution's IT equipment inventory.
