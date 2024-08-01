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
  cy.get('span.ofd_page__header__save__fCkej').eq(1).click();
});

When("Open Button is clicked", () => {
  cy.contains('button', 'Open').eq(0).first().click();

});

When("Save Draft button is clicked", () => {
  cy.contains('span', 'Save Draft').click();
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
  cy.contains("span", "Options").should("exist");
  cy.contains("span", "Save").should("exist");
  cy.get("div.CircularNode_container__task__V_yNM div").eq(0).should("exist");
  cy.contains("span", "My work").should("exist");
});

Then("the Action items in workspace should get displayed", () => {
  cy.contains("span", "Sparql Convert Action").should("exist");
  cy.contains("span", "Script Action").should("exist");
  cy.contains("span", "Virtual Graph Action").should("exist");
  cy.contains("span", "Result Action").should("exist");
  cy.contains("span", "HTTP Action").should("exist");
  cy.contains("span", "Result Action").should("exist");
  cy.contains("span", "SOAP Action").should("exist");
});



Then("the Parameters should get displayed", () => {
  cy.contains("li", "Parameters").click();
  cy.contains("span", "Token Credentials Parameter").should("exist");
  cy.contains("span", "Standard Parameter").should("exist");
  cy.contains("span", "Basic Credentials Parameter").should("exist");
  cy.contains("span", "HTTP Parameter").should("exist");
});

Then("the Scripts items should get displayed", () => {
  cy.contains("li", "Scripts").click();
  cy.contains("span", "Groovy Script").should("exist");
  cy.contains("span", "Python Script").should("exist");
});

Then("Success message should get displayed", () => {
  cy.get('tds-toast[subheader="Graph has been successfully saved"]').should("be.visible");
});

Then("Error message should get displayed", () => {
  cy.get('tds-toast[subheader="The graph could not be saved"]').should("be.visible");
});

Then("Test name should get displayed", () => {
  cy.get('h3').should("be.visible").and("contain.text", "Test-Name")
});

Then("Test description should get displayed", () => {
  cy.get('p').should("be.visible").and("contain.text", "Test Description")
});

Then("Delete Button should get displayed", () => {
  cy.contains('button', 'Delete').eq(0).focus();
  cy.contains('button', 'Delete').eq(0).should("be.visible");
});

Then("Open Button should get displayed", () => {
  cy.contains('button', 'Open').eq(0).should("be.visible");
});

Then("Draft state should get displayed", () => {
  cy.contains('dd', 'Draft').should("be.visible");
});

Then("Saved state should get displayed", () => {
  cy.contains('dd', 'Saved').should("be.visible");
});

Then("Draft state should not get displayed", () => {
  cy.contains('dd', 'Draft').should("not.exist");
});

Then("Graph page should get displayed", () => {
  cy.contains("span", "Options").should("exist");
  cy.contains("span", "Save").should("exist");
});



