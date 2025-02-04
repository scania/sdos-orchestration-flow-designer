# Orchestration Flow Designer (OFD)

![Project Status: Under Development](https://img.shields.io/badge/Status-Under%20Development-orange) ![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)

The **Orchestration Flow Designer (OFD)** is a graphical user interface application that leverages knowledge graphs as a self-service tool. It enables users to create project- or domain-specific flow graphs, simplifying and accelerating data orchestration.

For additional information and a demo video, please see the [resources folder](https://github.com/scania/sdos/tree/main/doc/resources).

---

## Getting Started

### Prerequisites

- **Node.js:** Version 20 or later is recommended.
- **Stardog:** Version 9.x or later (used as the RDF database for storing knowledge graphs).
- **SDOS:** SDOS service [SDOS repository](https://github.com/scania/sdos) and that it is configured for integration.
- **OBO Flow:** Required to connect with both Stardog and SDOS. Make sure OBO Flow is properly configured.
- **GitHub:** To clone or download the source code.
- **Azure Active Directory:** For Single Sign-On (SSO) support.
- Other tools such as Prisma and Storybook are used for database migrations and UI development respectively.

You can verify your Node.js and npm versions by running:

```bash
node -v
npm -v
```

### Installation

1.  **Clone the Repository:**

    ```
    git clone https://github.com/your-organization/orchestration-flow-designer.git
    cd orchestration-flow-designer
    ```

2.  **Install Dependencies:**

    ```
    npm install
    ```

    This command installs all necessary modules listed in `package.json` into your local `node_modules` directory.

---

## Environment Variables

Before running the application, create a `.env.local` file in the root directory and define the following environment variables.

### Azure Active Directory Configuration

- **OFD_AZURE_AD_CLIENT_ID:** Your Azure AD application (client) ID.
- **OFD_AZURE_AD_CLIENT_SECRET:** Your Azure AD application secret.
- **OFD_AZURE_AD_TENANT_ID:** Your Azure AD tenant ID.

### SDOS Configuration

- **SDOS_CLIENT_ID:** Your SDOS client ID.
- **SDOS_ENDPOINT:** The endpoint URL for SDOS services.

### Stardog Database Configuration

- **STARDOG_CLIENT_ID:** Your Stardog client identifier.
- **STARDOG_ENDPOINT:** The endpoint URL for the Stardog database.
- **STARDOG_DB_NAME_WRITE:** The name of the writable Stardog database.

### NextAuth and Database Configuration

- **NEXTAUTH_URL:** The URL of your Next.js application (used for authentication callbacks).
- **NEXTAUTH_SECRET:** A secret (UUID) used by NextAuth for secure operations.
- **DATABASE_URL:** The connection URL for your application’s database.

### Additional & Optional Settings

- **LOG_LEVEL:** _(Optional)_ Logging level (`debug`, `info`, `warn`, or `error`).
- **NODE_ENV:** _(Optional)_ The environment mode (`development`, `test`, or `production`).
- **TEST_BASE_URL:** _(Optional)_ Base URL for testing purposes.
- **ADMIN_EMAILS:** _(Optional)_ A comma-separated list of administrator email addresses.

#### Example `.env.local` File

```
OFD_AZURE_AD_CLIENT_ID=your-azure-ad-client-id
OFD_AZURE_AD_CLIENT_SECRET=your-azure-ad-client-secret
OFD_AZURE_AD_TENANT_ID=your-azure-ad-tenant-id
SDOS_CLIENT_ID=your-sdos-client-id
SDOS_ENDPOINT=https://your-sdos-endpoint.com
STARDOG_CLIENT_ID=your-stardog-client-id
STARDOG_ENDPOINT=https://your-stardog-endpoint.com
STARDOG_DB_NAME_WRITE=your-stardog-db-name
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
DATABASE_URL=your-database-connection-url
LOG_LEVEL=debug
NODE_ENV=development
TEST_BASE_URL=http://localhost:3000
ADMIN_EMAILS=admin@example.com
```

**Note:** Environment variables are validated at runtime by the `validateEnv.js` script. During the build process, they are treated as optional, but they must conform to the defined schema when starting the application.

---

## Available Scripts

The project defines several npm scripts in `package.json`:

- **`npm run dev`**: Validates environment variables (via `node validateEnv.js`) and starts the Next.js development server.
- **`npm run build`**: Builds the application for production.
- **`npm start`**: Runs the built application in production mode (the `prestart` script also validates the environment).
- **`npm run test`**: Executes end-to-end tests using Playwright.
- **`npm run test-unit`**: Runs unit tests via Jest.
- **`npm run lint`**: Checks the code for linting errors.
- **`npm run storybook`**: Starts the Storybook development server on port 6006.
- **`npm run build-storybook`**: Builds a static version of the Storybook site.
- **`npm run prismaMigrateLocal`**: Runs Prisma migrations in development mode.
- **`npm run prismaReset`**: Resets your local Prisma migrations.
- **`npm run check-licenses`**: Checks for license compatibility issues across dependencies.

---

## Running the Application

### Development Mode

To start the development server with environment validation:

```
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Mode

1.  **Build the Application:**

    ```
    npm run build
    ```

2.  **Start the Production Server:**

    ```
    npm start
    ```

    Your application will be accessible at the URL specified by `NEXTAUTH_URL` (e.g., [http://localhost:3000](http://localhost:3000)).

---

## Testing & Linting

- **End-to-End Testing (Playwright):**

  ```
  npm run test
  ```

- **Unit Testing (Jest):**

  ```
  npm run test-unit
  ```

- **Linting:**

  ```
  npm run lint
  ```

---

---

## Database Migrations

- **Apply Migrations Locally:**

  ```
  npm run prismaMigrateLocal
  ```

- **Reset Prisma Migrations:**

  ```
  npm run prismaReset
  ```

---

## License

This project is licensed under the [AGPL-3.0 License](https://www.gnu.org/licenses/agpl-3.0).

---

## Support

If you encounter issues, discover bugs, or have questions regarding the application, please visit our [Community Page](https://github.com/scania/sdos/discussions) for discussions and support from the OFD-SDOS development team.
