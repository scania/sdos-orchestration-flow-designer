import { Given, Then, When } from "@badeball/cypress-cucumber-preprocessor";

Given("OFD page is in view", () => {
  cy.visit("/ofd/test");
  cy.get("body").should("contain.text", "Library");
});

Then("task node should be visible", () => {
  cy.get(" .react-flow__node.react-flow__node-input.nopan.selectable")
    .should("be.visible")
    .should("contain.text", "Task");
});
