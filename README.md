# Ledgerline — Personal Finance Tracker

A full-stack personal finance tracker for recording income and expenses, reviewing monthly balances, managing categories, uploading profile pictures, and viewing platform-wide admin statistics.

The repository contains a React/Vite frontend and a Node.js/Express API backed by MongoDB.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Requirements](#requirements)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Application Behavior](#application-behavior)
- [API Reference](#api-reference)
- [Creating an Admin Account](#creating-an-admin-account)
- [Production Deployment with Render](#production-deployment-with-render)
- [Security and Operational Notes](#security-and-operational-notes)
- [Troubleshooting](#troubleshooting)
- [Manual Smoke Test](#manual-smoke-test)
- [Future Improvements](#future-improvements)
- [License](#license)

## Features

- User registration, login, logout, and JWT-protected sessions
- Personal income and expense records with create, edit, delete, and filtering support
- Monthly totals, balance, and category-level spending breakdown
- Built-in and user-created categories
- Optional Cloudinary profile-picture uploads
- Role-based admin dashboard with platform metrics
- Input validation with Zod, rate limiting, Helmet security headers, CORS controls, and Swagger/OpenAPI documentation
- Separate development and production database configuration

## Technology Stack

| Area | Technologies |
| --- | --- |
| Frontend | React 18, React Router, Vite |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB Community Server (local) or MongoDB Atlas (production) |
| Authentication | JWT and bcrypt |
| Validation | Zod |
| Files | Multer and Cloudinary |
| API documentation | Swagger UI / OpenAPI |
| Hosting | Render blueprint included in `render.yaml` |

## Project Structure

```text
finance-tracker/
├── client/                         # React/Vite frontend
│   ├── src/
│   │   ├── pages/                  # Login, registration, dashboard, profile, admin
│   │   ├── api.js                  # API client and VITE_API_URL handling
│   │   ├── auth.jsx                # Authentication context
│   │   └── App.jsx                 # Routes and protected pages
│   ├── .env.example
│   └── package.json
├── server/                         # Express/MongoDB API
│   ├── src/
│   │   ├── config/                 # Environment, database, Cloudinary config
│   │   ├── docs/                   # Swagger definition and route documentation
│   │   ├── middleware/             # Auth, validation, uploads, error handling
│   │   ├── models/                 # User, Transaction, Category schemas
│   │   ├── routes/                 # API endpoints
│   │   ├── schemas/                # Zod request validation
│   │   ├── app.js                  # Express app configuration
│   │   ├── server.js               # Application entry point
│   │   └── seed.js                 # Default categories and optional admin creation
│   ├── .env.example
│   └── package.json
├── render.yaml                     # Render deployment blueprint
└── README.md
```

## Requirements

Install these once before running the project:

- [Node.js](https://nodejs.org/) 18 or newer (Node.js 20 LTS recommended)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) for local development
- Git, only if you are cloning or deploying through GitHub
- A [Cloudinary](https://cloudinary.com/) account, only if you want profile-picture uploads
- MongoDB Atlas, only if you want a hosted production database

> **Note:** MongoDB Compass is optional. It is a database browser; it does not run the MongoDB server.

## Quick Start

### 1. Get the source code

Clone the repository or extract the project ZIP, then open the `finance-tracker` folder in VS Code.

### 2. Create environment files

The repository includes examples but never includes real secrets.

**Windows PowerShell**

```powershell
cd server
Copy-Item .env.example .env

cd ..\client
Copy-Item .env.example .env
```

**macOS / Linux**

```bash
cd server
cp .env.example .env

cd ../client
cp .env.example .env
```

### 3. Configure the backend

Edit `server/.env` for local development:

```dotenv
PORT=5000
NODE_ENV=development
MONGO_URI_DEV=mongodb://127.0.0.1:27017/personal-finance-tracker

JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
API_URL=http://localhost:5000

# Optional: profile-picture uploads
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# These are used only when NODE_ENV=production
MONGODB_USERNAME=
MONGODB_PASSWORD=
MONGODB_URI_PRO=
```

Generate a strong JWT secret before deploying:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 4. Configure the frontend

The default `client/.env` is correct for local development:

```dotenv
VITE_API_URL=http://localhost:5000
```

### 5. Start MongoDB

Start the local MongoDB service before starting the API.

On Windows, use the **Services** application and start the MongoDB service. If MongoDB was installed as a service, the following may also work from an Administrator PowerShell:

```powershell
Start-Service MongoDB
```

### 6. Install dependencies and run the application

Open two terminals in VS Code.

**Terminal 1 — API**

```bash
cd server
npm install
npm run dev
```

**Terminal 2 — Frontend**

```bash
cd client
npm install
npm run dev
```

Open the URL Vite prints in the terminal, normally <http://localhost:5173>.

The API runs at <http://localhost:5000>, and interactive Swagger documentation is available at <http://localhost:5000/docs>.

> **Tip:** `npm install` installs all required packages from the relevant `package.json`. Do not install Express, React, Vite, Mongoose, or other project dependencies one by one.

## Environment Variables

### Backend: `server/.env`

| Variable | Required in | Purpose |
| --- | --- | --- |
| `PORT` | Development | API port; defaults to `5000`. Render supplies its own port in production. |
| `NODE_ENV` | Both | Use `development` locally and `production` on the deployed API. |
| `MONGO_URI_DEV` | Development | Local or development MongoDB URI. |
| `MONGODB_URI_PRO` | Production | Atlas cluster hostname or complete MongoDB connection string. |
| `MONGODB_USERNAME` | Production, when needed | Atlas database username. |
| `MONGODB_PASSWORD` | Production, when needed | Atlas database password. |
| `JWT_SECRET` | Both | Secret used to sign and verify JWTs. Use a long, unique, random value. |
| `JWT_EXPIRES_IN` | Optional | JWT duration, for example `1d` or `7d`; defaults to `7d`. |
| `CLIENT_URL` | Both | Allowed frontend origin(s). Separate multiple URLs with commas. |
| `API_URL` | Optional | API URL shown in local Swagger documentation. |
| `CLOUDINARY_CLOUD_NAME` | Optional | Cloudinary cloud name. |
| `CLOUDINARY_API_KEY` | Optional | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | Optional | Cloudinary API secret. |
| `ADMIN_NAME` | Optional | Name for the admin created by `npm run seed`. |
| `ADMIN_EMAIL` | Optional | Email for the admin created or promoted by `npm run seed`. |
| `ADMIN_PASSWORD` | Optional | Password for an admin created by `npm run seed`. |

### Frontend: `client/.env`

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | Yes | Complete base URL of the API, without a trailing slash. |

Vite only exposes environment variables that begin with `VITE_`. Restart the Vite server after changing `client/.env`.

### Development vs. production database behavior

The API chooses the database deliberately:

| `NODE_ENV` value | Database source |
| --- | --- |
| `development` or omitted | Requires `MONGO_URI_DEV`. |
| `production` | Requires `MONGODB_URI_PRO`; uses Atlas credentials when the supplied URI needs them. |

For production, `MONGODB_URI_PRO` may be either:

- a full connection string, such as `mongodb+srv://<username>:<password>@cluster.example.mongodb.net/finance_tracker?retryWrites=true&w=majority`; or
- a cluster hostname, such as `cluster.example.mongodb.net`, together with `MONGODB_USERNAME` and `MONGODB_PASSWORD`.

> **Note:** The project temporarily accepts the legacy misspelled `CLAUDINARY_*` Cloudinary variables. New deployments should always use the standard `CLOUDINARY_*` names.

## Available Scripts

### API scripts

Run these inside `server/`:

| Command | Purpose |
| --- | --- |
| `npm start` | Starts the API normally. Used by Render. |
| `npm run dev` | Starts the API with Node's watch mode for local development. |
| `npm run seed` | Ensures default categories exist and optionally creates or promotes an admin. |

### Frontend scripts

Run these inside `client/`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Starts the Vite development server. |
| `npm run build` | Creates the production frontend in `client/dist`. |
| `npm run preview` | Serves the previously built frontend locally for a production-like check. |

When lock files are present, `npm ci` can be used on a clean machine for an exact, repeatable installation.

## Application Behavior

### Authentication and authorization

- Registration requires a name, a valid email address, and a password of at least eight characters.
- A registration request always creates a normal `user`; clients cannot assign themselves the `admin` role.
- Login returns a JWT, which the frontend stores in browser local storage.
- Protected requests use `Authorization: Bearer <token>`.
- The `/admin` frontend page and the `/admin/overview` API endpoint require the `admin` role.

### Transactions

Each transaction belongs to the currently authenticated user.

- Types: `income` or `expense`
- Amounts must not be zero.
- Income must be positive.
- Expenses can be submitted as either `50` or `-50`; both are stored as `50`, while the `type` determines whether the amount is income or expense.
- Dates are sent as ISO dates, such as `2026-10-21`.
- Transaction lists can be filtered by month using `YYYY-MM`.

### Default categories

The API ensures these categories exist when the server starts:

| Type | Categories |
| --- | --- |
| Expense | Food, Rent, Transport, Utilities, Health, Entertainment, Shopping, Education, Other |
| Income | Salary, Freelance, Investments, Gift, Other Income |

Users may create additional private categories. A custom category is visible only to its owner.

### Profile-picture upload

Profile-picture uploads are optional and require all three `CLOUDINARY_*` variables.

- **Endpoint:** `POST /upload/profile-picture`
- **Accepted types:** JPEG, PNG, WebP
- **Maximum file size:** 2 MB
- **Processing:** uploads are resized and cropped to 400 × 400 pixels
- If Cloudinary is not configured, the endpoint returns HTTP `503`.

## API Reference

Swagger provides the authoritative interactive API reference at:

```text
http://localhost:5000/docs
```

After logging in, copy the returned token into Swagger's **Authorize** dialog to test protected endpoints.

### Public endpoints

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/` | API name and documentation location |
| `GET` | `/health` | Health-check response |
| `POST` | `/auth/register` | Create a normal user account |
| `POST` | `/auth/login` | Authenticate and receive a JWT |

### Protected user endpoints

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/auth/profile` | Get the current user profile |
| `GET` | `/transactions` | List the current user's transactions |
| `POST` | `/transactions` | Create a transaction |
| `GET` | `/transactions/monthly-summary?month=YYYY-MM` | Get the month's income, expenses, balance, and category totals |
| `PUT` | `/transactions/:id` | Update one of the current user's transactions |
| `DELETE` | `/transactions/:id` | Delete one of the current user's transactions |
| `GET` | `/categories` | List default and user-owned categories |
| `POST` | `/categories` | Create a private category |
| `POST` | `/upload/profile-picture` | Upload a profile image |

### Admin endpoint

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/admin/overview` | View user, transaction, income, expense, and top-category statistics |

### Example: create a transaction

```bash
curl -X POST http://localhost:5000/transactions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Groceries",
    "amount": 45.50,
    "type": "expense",
    "category": "Food",
    "date": "2026-10-21"
  }'
```

A successful response follows this general format:

```json
{
  "success": true,
  "data": {
    "_id": "transaction-id",
    "title": "Groceries",
    "amount": 45.5,
    "type": "expense",
    "category": "Food",
    "date": "2026-10-21T00:00:00.000Z"
  }
}
```

Validation and application errors use this format:

```json
{
  "success": false,
  "message": "Validation failed",
  "details": [
    {
      "field": "amount",
      "message": "Amount cannot be zero"
    }
  ]
}
```

## Creating an Admin Account

Add these values to `server/.env` temporarily:

```dotenv
ADMIN_NAME=Site Administrator
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Use-a-strong-password
```

Then run:

```bash
cd server
npm run seed
```

The command creates the account if it does not exist, or promotes the matching existing user to the `admin` role. Remove `ADMIN_PASSWORD` from production environment variables after the one-time setup if it is no longer needed.

## Production Deployment with Render

The supplied `render.yaml` creates two services:

| Service | Type | Source folder | Purpose |
| --- | --- | --- | --- |
| `finance-tracker-api` | Node web service | `server` | Express API |
| `finance-tracker-web` | Static site | `client` | React frontend |

### Deployment steps

1. Push the project to a private or public GitHub repository.
2. Confirm that neither `server/.env` nor `client/.env` is committed.
3. In Render, choose **New → Blueprint** and select the repository.
4. Render reads `render.yaml` and creates the API and static-site services.
5. Set these API environment variables in the Render dashboard:

   | Variable | Notes |
   | --- | --- |
   | `MONGODB_URI_PRO` | Required |
   | `MONGODB_USERNAME` | Only when required by the URI |
   | `MONGODB_PASSWORD` | Only when required by the URI |
   | `CLIENT_URL` | Exact URL of the deployed frontend |
   | `CLOUDINARY_CLOUD_NAME` | Optional |
   | `CLOUDINARY_API_KEY` | Optional |
   | `CLOUDINARY_API_SECRET` | Optional |

   Render already sets `NODE_ENV=production` and generates `JWT_SECRET`.

6. Set the frontend environment variable:

   ```text
   VITE_API_URL=https://your-api-name.onrender.com
   ```

7. Redeploy the frontend after changing `VITE_API_URL`; Vite inserts this value during the build.
8. Visit `https://your-api-name.onrender.com/docs` to check the live API.

> **Important:** Do not configure `MONGO_URI_DEV` on Render. Production uses `MONGODB_URI_PRO` exclusively.

### MongoDB Atlas checklist

1. Create an Atlas project and database deployment.
2. Create a database user with a strong password.
3. Add the database user credentials to Render environment variables.
4. Add a network-access rule that permits the Render service to connect. Review and restrict the rule where your deployment plan permits.
5. Use the Atlas connection string or host in `MONGODB_URI_PRO`.

## Security and Operational Notes

- Never commit, upload, or paste real `.env` files into source control.
- Rotate any JWT, MongoDB, or Cloudinary secret that was accidentally shared.
- Use a different JWT secret for every environment.
- Use HTTPS in production; Render provides HTTPS for deployed services.
- Set `CLIENT_URL` to the exact frontend URL to restrict browser access through CORS.
- Auth routes are rate-limited more strictly than general routes.
- The API hides internal server-error details when `NODE_ENV=production`.
- JWTs are currently stored in browser local storage. For a higher-security production system, consider short-lived access tokens plus secure HTTP-only refresh-token cookies.
- Run `npm audit` periodically, review changes, and avoid blindly running `npm audit fix --force` on a production project.

## Troubleshooting

### MongoDB connection fails

**Typical messages:** `ECONNREFUSED 127.0.0.1:27017` or `Failed to start server`.

- Confirm MongoDB Community Server is installed and running.
- Confirm `MONGO_URI_DEV` points to the right server and database.
- For Atlas, confirm the network rule, username, password, and connection string.

### The browser says it cannot reach the server

- Start the API first with `npm run dev` in `server/`.
- Confirm `VITE_API_URL=http://localhost:5000` in `client/.env`.
- Restart Vite after editing `client/.env`.
- Open <http://localhost:5000/health> to verify the API responds.

### CORS error in the browser

- Confirm `CLIENT_URL` exactly matches the frontend origin, including `http` or `https` and its port.
- Restart the API after changing `server/.env`.
- For several allowed origins, separate them with commas:

  ```dotenv
  CLIENT_URL=http://localhost:5173,https://your-frontend.onrender.com
  ```

### Profile-picture upload returns 503

Cloudinary has not been configured. Add valid `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` values, then restart the API.

### Port 5000 or 5173 is already in use

Stop the other application using the port, or choose a different port.

- To change the API port, edit `PORT` and update `VITE_API_URL` to match.
- Vite normally offers another available port automatically.

### npm shows deprecation, audit, or install-script warnings

Warnings do not necessarily mean installation failed. First check whether `npm run dev` starts correctly.

- Use `npm audit` to inspect the affected dependency tree.
- Review dependency changes before applying automatic fixes.
- If Vite reports an esbuild binary or install-script error, approve the `esbuild` install script only after verifying the package source.
- If bcrypt reports a native-module installation error, approve or rebuild only the bcrypt install script after review.

## Manual Smoke Test

Use this sequence after a fresh setup:

1. Start MongoDB, the API, and the frontend.
2. Create a user account.
3. Add one income and one expense.
4. Verify the balance and category summary.
5. Edit and delete a transaction.
6. Create a custom category and use it in a transaction.
7. Optionally configure Cloudinary and upload a profile image.
8. Create an admin account with `npm run seed`, then verify the admin dashboard.
9. Open `/docs` and verify a protected endpoint using a JWT.

## Future Improvements

Useful next steps for a production-grade version include:

- [ ] Automated unit, API, and end-to-end tests
- [ ] Password-reset and email-verification flows
- [ ] Refresh-token support with secure HTTP-only cookies
- [ ] Transaction exports (CSV/PDF) and richer analytics
- [ ] Currency selection instead of the current USD-only frontend formatter
- [ ] Pagination and date-range controls in the interface
- [ ] Database backups, monitoring, structured logs, and error tracking
- [ ] Continuous integration for linting, tests, dependency scanning, and deployment

## License

No license file is currently included. Add a `LICENSE` file before distributing or open-sourcing the project so future users understand their permissions.