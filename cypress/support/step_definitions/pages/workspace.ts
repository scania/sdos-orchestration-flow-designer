import { Given, Then, When } from "@badeball/cypress-cucumber-preprocessor";

// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------
// -------------------------------- GIVEN ---------------------------------------------
// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------

// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------
// -------------------------------- WHEN ----------------------------------------------
// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------

When("the Add to graph button is clicked", () => {
  const dataTransfer = new DataTransfer();
  cy.get('tds-button[text="Add to graph"] button').click({force: true,multiple: true});
  cy.wait(5000);
  cy.get('*[class^=".CircularNode_chip__Oe5LY.CircularNode_chip__primary__xwiW9"]').trigger("dragstart", { dataTransfer });
  cy.get("div.react-flow__node").trigger("drop", { dataTransfer });
});

When("the action button is clicked", () => {
  cy.contains("span", "Sparql Convert Action").click({
    force: true,
    multiple: true,
  });
});

When("the action button is dragged", () => {
  const dataTransfer = new DataTransfer();
  cy.get("div[draggable=true]").first().trigger("dragstart", { dataTransfer });
  cy.get("div.react-flow__node").trigger("drop", { dataTransfer });
});

When("the My work icon is clicked", () => {
  cy.get(".ofd_page__header__back___Ml0u").click({
    force: true,
    multiple: true,
  });
});

When("the connector is linked", () => {
  cy.get('div[data-handlepos="right"]').first().click();
  cy.get('div[data-handlepos="left"]').click();
});

When("Save button is clicked", () => {
  cy.contains("span", "Save").click();
});

// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------
// -------------------------------- THEN ----------------------------------------------
// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------

Then("the workspace page should be visible", () => {
  cy.get(".ofd_page__header__back___Ml0u").contains("My work");
});

Then("a new graph should open in the workspace", () => {
  cy.get(".ofd_page__header__back___Ml0u").contains("My work");
});

Then("the elements in workspace gets displayed", () => {
  cy.contains("li", "Actions").should("exist");
  cy.contains("li", "Parameters").should("exist");
  cy.contains("li", "Scripts").should("exist");
  cy.contains("h6", "Library").should("exist");

  cy.contains("span", "Sparql Convert Action").should("exist");
  cy.contains("span", "Script Action").should("exist");
  cy.contains("span", "Virtual Graph Action").should("exist");
  cy.contains("span", "Result Action").should("exist");
  cy.contains("span", "HTTP Action").should("exist");
  cy.contains("span", "Result Action").should("exist");
  cy.contains("span", "SOAP Action").should("exist");

  cy.contains("li", "Parameters").click();
  cy.contains("span", "Token Credentials Parameter").should("exist");
  cy.contains("span", "Standard Parameter").should("exist");
  cy.contains("span", "Basic Credentials Parameter").should("exist");
  cy.contains("span", "HTTP Parameter").should("exist");

  cy.contains("li", "Scripts").click();
  cy.contains("span", "Groovy Script").should("exist");
  cy.contains("span", "Python Script").should("exist");

  cy.contains("span", "Options").should("exist");
  cy.contains("span", "Save").should("exist");
  cy.get("div.CircularNode_container__task__V_yNM div").eq(0).should("exist");
  cy.contains("span", "My work").should("exist");
});

Then("Success message should get displayed", () => {
  cy.get('tds-toast[subheader="Graph has been successfully saved"]').should(
    "be.visible"
  );
});
