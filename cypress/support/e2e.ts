/*  
    This file is executed before each spec-file.
    Here we:
    * define reusable code to be used in several tests
    * import plugins
    * define before- and beforeEach-hooks
*/
// cypress/support/commands.js
import "cypress-mochawesome-reporter/register";
import { env } from "../../src/lib/env";
Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});

beforeEach(() => {
   loginViaAAD(env.TEST_USERNAME || "", env.TEST_PASSWORD || "");
   deleteAllGraphs();
});

function loginViaAAD(username: string, password: string) {
  cy.session(
    "auto_OFD Test",
    () => {
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
    },
    {
      validate() {
        cy.visit("/");
        cy.get("button").contains("Sign in").click();
        cy.contains("h2", "My Work").should("be.visible");
      },
    }
  );
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
    cy.get('body').then(($body) => {
      if ($body.find('button.danger').length > 0) {
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

afterEach(() => {
    deleteAllGraphs();
    logOff();
  });

  