// cypress/support/e2e.js

import "cypress-mochawesome-reporter/register";
import './commands';
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
//log off
// afterEach(() => {

//     cy.get('img[alt="User menu."]').click();
//     cy.get('a > :nth-child(1) > .tds-u-pl1').click();
//     cy.clearCookies();
//     cy.clearLocalStorage();
// });
