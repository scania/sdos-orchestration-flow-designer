import "cypress-mochawesome-reporter/register";
Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});
beforeEach(() => {
  const currentTestFile = Cypress.spec.relative;
  // Avoid login for integration tests
  if (currentTestFile.endsWith(".test.ts")) return;

  const username = Cypress.env("TEST_USERNAME");
  const password = Cypress.env("TEST_PASSWORD");

  if (!username || !password) {
    throw new Error("Test credentials missing");
  }

  cy.session([username, password], () => {
    loginViaAAD(username, password);
  });

  deleteAllGraphs();
  checkAndCloseErrorPopup();
});

const checkAndCloseErrorPopup = () => {
  cy.get("body").then(($body) => {
    if ($body.text().includes("Unhandled Runtime Error")) {
      // Close the error popup if found
      cy.get(
        'button[data-nextjs-errors-dialog-left-right-close-button="true"]'
      ).click();
    }
  });
};

function loginViaAAD(username, password) {
  cy.visit("/");
  cy.get("button").contains("Sign in").click();
  cy.origin(
    "login.microsoftonline.com",
    {
      args: {
        username,
        password,
      },
    },
    ({ username, password }) => {
      cy.get('input[type="email"]').type(username + "{enter}", {
        log: false,
      });
      cy.get('input[type="password"]').type(password, { log: false });
      cy.get('input[type="submit"]').click();
    }
  );
  // Validate that the login was successful
  cy.visit("/");
  cy.get("button").contains("Sign in").click();
  cy.get("h2").contains("My Work").should("be.visible");
}

function logOff() {
  cy.get('img[alt="User menu."]').click();
  cy.get("a > :nth-child(1) > .tds-u-pl1").click();
  cy.wait(2000);
  cy.get("button").contains("Sign in").should("be.visible");
  cy.clearCookies();
  cy.clearLocalStorage();
}

function deleteAllGraphs() {
  cy.visit("/");
  cy.get("body").then(($body) => {
    if ($body.find("button.danger").length > 0) {
      cy.get("button.danger").then((deleteButtons) => {
        const totalItems = deleteButtons.length;
        // Function to handle the deletion process sequentially
        function deleteItem(index) {
          if (index < totalItems) {
            cy.get("button.danger").first().click();
            cy.contains("button", "Delete graph").click();
            cy.wait(500);
            deleteItem(index + 1);
          } else {
            cy.log("All graphs deleted");
          }
        }
        deleteItem(0);
      });
    } else {
      cy.log("No graph to delete");
    }
  });
}

// afterEach(() => {
//   deleteAllGraphs();
//   logOff();
// });
