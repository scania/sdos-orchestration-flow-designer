## Orchestration Flow Designer (OFD)

![Project Status: Under Development](https://img.shields.io/badge/Status-Under%20Development-orange)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

The Orchestration Flow Designer (OFD) is a graphical user interface application that enables knowledge graphs as a self-service tool. It assists users in creating project/domain-specific flow graphs, facilitating intuitive and efficient data orchestration.

For more information and showcase video, see the [resources folder](https://github.com/scania/sdos/tree/main/doc/resources).

## Building and Running

### Prerequisites

- Node >= 18.17 (for building and running the application)
- Stardog >= 9.x (RDF db for saving the knowledge graph)
- Github (to download the source code)
- Azure AD (to support SSO)

Ensure you have Node.js and npm installed, version of node is 16.14 or later. You can check their versions by running

```bash
node -v
npm -v
```

### Installation

First, navigate to the root directory of your Next.js project and install the necessary dependencies using:

```bash
npm install
```

This will compile and bundle your code, and generate a .next directory containing the built application.

All the neccessary modules required to run the current next project will be install into local node modules.

By default, npm install will install all modules listed as dependencies in package.json.

### Setting Up Environment Variables

To run this project, you will need to add the following environment variables to your `.env.local` file in the root of your project. Create the file if it doesn't already exist.

### Azure Active Directory Configuration

- `AZURE_AD_CLIENT_ID` - Your Azure AD application (client) ID.
- `AZURE_AD_CLIENT_SECRET` - Your Azure AD application secret.
- `AZURE_AD_TENANT_ID` - Your Azure AD tenant ID.

These three env variables should be added as part of authenticating the user in the local. These variables must be added in .env.local file. for more information such adding call back URL visit https://next-auth.js.org/providers/azure-ad

### Stardog Database Configuration

- `STARDOG_USERNAME` - Username for Stardog database access.
- `STARDOG_PASSWORD` - Password for Stardog database access.
- `STARDOG_ENDPOINT` - Endpoint URL for the Stardog database.

### Next.js Configuration

- `NEXTAUTH_URL` - The URL of your Next.js application, used for authentication callbacks.
- `NEXT_PUBLIC_API_BASE_URL` - The base URL of your API, accessible from the client side.

### Application Logging and Environment Mode

- `LOG_LEVEL` - Optional. Sets the level of logging detail (e.g., `debug`, `info`, `warn`, `error`).
- `NODE_ENV` - Optional. Explicitly Specifies the environment in which the application is running. Acceptable values are `development`, `test`, `production`.

Example `.env.local` file:

```env
AZURE_AD_CLIENT_ID=your-azure-ad-client-id
AZURE_AD_CLIENT_SECRET=your-azure-ad-client-secret
AZURE_AD_TENANT_ID=your-azure-ad-tenant-id
STARDOG_USERNAME=your-stardog-username
STARDOG_PASSWORD=your-stardog-password
STARDOG_ENDPOINT=your-stardog-endpoint
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

### Getting started to run the development server

To run the development server execute:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building the Application

To create a production build of your Next.js application run:

```bash
npm run build
```

npm run build creates a build directory with a production build of your app.

Inside the build/static directory will be your JavaScript and CSS files.

Each filename inside of build/static will contain a unique hash of the file contents. This hash in the file name enables long term caching techniques.

When running a production build of freshly created Create React App application, there are a number of .js files (called chunks) that are generated and placed in the build/static/js directory:

### Starting the Application

After building, you can start the application in production mode with:

```bash
npm start
```

Your application should now be running on http://localhost:3000/ or the port specified in your configuration.

# <span style="color:gold">Orchestration Flow Designer - Test Suite</span>

This is the end-to-end test suite for the Orchestration Flow Designer (OFD) which tests the funtionality of the application from a user perspective.
The test suite is developed using Cypress and include plugins for Cucumber (BDD) and reporting of results, among else.

## <span style="color:goldenrod">Installing dependencies </span>

The dependencies needed to run and develop the test suite is listed in the `package.json`. After the prerequisites has been set up we can install these dependencies simply by running this command in the top folder of the project:

```bash
npm install
```

(Note: there may be a need to execute this command as administator in Windows. In that case you must also execute the tests as administrator after installing.)

## <span style="color:goldenrod">Executing the test suite</span>

The tests can be run in one of two ways; using the Cypress CLI, or using the Cypress GUI:

```bash
# The CLI
npx cypress run
# The GUI
npx cypress open
```

The GUI is mostly used during development and includes a visual display of the executing test in real time, reload of test upon change in test file, and helps in finding html-selectors in the DOM to use in test cases.

The CLI, on the other hand, only runs in the command line and presents the results of the test execution in text form as it goes. A test report is generated after the test execution has finished can be found in `cypress/reports/`. This report is only generated when using the CLI and is an HTML-report containing the complete execution with passed/failed tests, charts over the completion rates, and screenshots of the webpage in case of errors.

### <span style="color:darkgoldenrod">Tagging and filtering</span>

It is also possible running individual test cases or a sub-set of tests using tags. A tag can be set by including a `@<my-tag>` above either the Feature or the Scenario keywords in the testfiles, more about this under the **Development**-section.
The tags can then be used together to form selections based on boolean operators such as `and`, `or` and `not`.

The command for then executing the tests using tags would be i.e.:

```bash
# Execute tests with the tag @smoke
npx cypress run -e TAGS=@smoke
# Execute tests marked with @smoke but not with @wip (Work In Progress)
npx cypress run -e TAGS="@smoke and not @wip"
```

Along with these filtering options there are two configurations in the `package.json` to know about; **filterSpecs** and **omitFiltered**.
filterSpecs=true means that a pre-filtering is made prior to execution in order to only load the tes files containing tests that matches the filter, the default behaviour is to load every test file and perform the filtering during run-time. omitFiltered=true means that all tests that do not match the filter is left out of the report instead of being marked as "pending", as is the default behaviour .

## Support

If you encounter any issues, find any bugs, or have questions regarding the application, please visit our [Community Page](https://github.com/scania/sdos/discussions) for discussions and support from the OFD-SDOS development team.
