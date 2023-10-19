This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) 
## Building and Running
### Prerequisites
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

## Getting started to run the development server

To run the development server execute:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

# <span style="color:gold">Orchestration Flow Designer - Test Suite</span>

This is the end-to-end test suite for the Orchestration Flow Designer (OFD) which tests the funtionality of the application from a user perspective.
The test suite is developed using Cypress and include plugins for Cucumber (BDD) and reporting of results, among else.

## <span style="color:goldenrod">Prerequisites</span>

There are some tools and software needed in order to be able to develop and/or execute the tests.
These are listed as follows:

- [Git](https://git-scm.com) - used for version control as well as to fetch/download the test suite from Gitlab.
- [Visual Studio Code](https://code.visualstudio.com) - for editing the tests. Note: other text editor can be used.
- [Node](https://nodejs.org/en/download) - used for executing tests and installing dependencies.

## <span style="color:goldenrod">Installing dependencies </span>

The dependencies needed to run and develop the test suite is listed in the `package.json`. After the prerequisites has been set up we can install these dependencies simply by running this command in the top folder of the project:

```bash
npm install
```

(Note: there may be a need to execute this command as administator in Windows. In that case you must also execute the tests as administrator after installing.)


## <span style="color:goldenrod">Adding Environment Varibles </span>

The Environment Varibles are needed for using the Azure Authentication in the local. 

```bash
AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=
AZURE_AD_TENANT_ID=
```

These three env variables should be added as part of autheticating the user in the local. These variables must be added in .env.local file.  for more information such adding call back URL visit https://next-auth.js.org/providers/azure-ad

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
filterSpecs=true means that a pre-filtering is made prior to execution in order to only load the tes files containing tests that matches the filter, the default behaviour is to load every test file and perform the filtering during run-time. omitFiltered=true means that all tests that do not match the filter is left out of the report instead of being marked as "pending", as is the default behaviour.

## <span style="color:goldenrod">Development</span>

## <span style="color:goldenrod">Reporter</span>
