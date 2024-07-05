import { Given, Then, When } from "@badeball/cypress-cucumber-preprocessor";

// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------
// -------------------------------- GIVEN ---------------------------------------------
// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------

Given("OFD home page is in view", () => {
  cy.visit("/");
  cy.get("tds-header-title").should(
    "contain.text",
    "ORCHESTRATION FLOW DESIGNER BETA 0.7.1"
  );
});

// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------
// -------------------------------- WHEN ----------------------------------------------
// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------

When("the button {string} is clicked", (text: string) => {
  cy.contains(text).click();
});

When(
  "{string} is entered in the text field with placeholder {string}",
  (text: string, field: string) => {
    cy.get('input[placeholder="' + field + '"]').type(text);
  }
);

When(
  "{string} is entered in the text area with placeholder {string}",
  (text: string, field: string) => {
    cy.get('textarea[placeholder="' + field + '"]').type(text);
  }
);

When("the text field with placeholder {string} is cleared", (field: string) => {
  cy.get('input[placeholder="' + field + '"]').clear();
});

When("the text area with placeholder {string} is cleared", (field: string) => {
  cy.get('textarea[placeholder="' + field + '"]').clear();
});

// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------
// -------------------------------- THEN ----------------------------------------------
// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------

Then("the home button should be visible", () => {
  cy.get("tds-header-brand-symbol").should("be.visible");
});
