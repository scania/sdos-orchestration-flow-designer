import { Then, When } from "@badeball/cypress-cucumber-preprocessor";

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
  cy.get('tds-button[text="Add to graph"] button').click({
    force: true,
    multiple: true,
  });
});

When("the action button is clicked", () => {
  cy.contains("span", "Sparql Convert Action").click({
    force: true,
    multiple: true,
  });
});

When("{string} action button is dragged", (action) => {
  const dataTransfer = new DataTransfer();
  switch (action) {
    case "Sparql Convert":
      cy.get("div[draggable=true]")
        .first()
        .trigger("dragstart", { dataTransfer })
        .click();
      cy.get("div.react-flow__node").trigger("drop", { dataTransfer });
      break;
    case "Script":
      cy.get("div[draggable=true]")
        .eq(1)
        .trigger("dragstart", { dataTransfer })
        .click();
      cy.get("div.react-flow__node").trigger("drop", { dataTransfer });
      break;
    case "Virtual Graph":
      cy.get("div[draggable=true]")
        .eq(2)
        .trigger("dragstart", { dataTransfer })
        .click();
      cy.get("div.react-flow__node").trigger("drop", { dataTransfer });
      break;
    case "Result":
      cy.get("div[draggable=true]")
        .eq(3)
        .trigger("dragstart", { dataTransfer })
        .click();
      cy.get("div.react-flow__node").last().trigger("drop", { dataTransfer });
      break;
    case "HTTP":
      cy.get("div[draggable=true]")
        .eq(4)
        .trigger("dragstart", { dataTransfer })
        .click();
      cy.get("div.react-flow__node").last().trigger("drop", { dataTransfer });
      break;
    case "SOAP":
      cy.get("div[draggable=true]")
        .eq(5)
        .trigger("dragstart", { dataTransfer })
        .click();
      cy.get("div.react-flow__node").trigger("drop", { dataTransfer });
      break;
    default:
      cy.log(`No action matched for ${action}`);
  }
});

When("the My work icon is clicked", () => {
  cy.get(".ofd_page__header__back___Ml0u").click({
    force: true,
    multiple: true,
  });
});

When("{string} connector is linked", (serial) => {
  switch (serial) {
    case "first":
      cy.get('div[data-handlepos="right"]').first().click();
      cy.get('div[data-handlepos="left"]').click();
      break;
    case "second":
      cy.get('div[data-handlepos="right"]').eq(1).click();
      cy.get('div[data-handlepos="left"]').eq(1).click();
      break;
    case "third":
      cy.get('div[data-handlepos="right"]').eq(2).click();
      cy.get('div[data-handlepos="left"]').eq(2).click();
      break;
    default:
      cy.log(`No connector for ${serial}`);
  }
});

When("Save button is clicked", () => {
  cy.get("span.ofd_page__header__save__fCkej").eq(1).click();
});

When("Save Draft button is clicked", () => {
  cy.contains("span", "Save Draft").click();
});

When(
  "user clicks on the element with data-tooltip {string}",
  (tooltipValue) => {
    cy.get(`div[data-tooltip="${tooltipValue}"] span`).click();
  }
);

When("No Name label is clicked", () => {
  cy.contains("h5", "No Name").should("exist");
  cy.contains("h5", "No Name").click();
});

When("labelName {string} is provided", (labelName: string) => {
  cy.get('input[type="text"]').eq(2).type(labelName);
});

When("Save button in panel  is clicked", () => {
  cy.get('tds-button[text="Save"] button').click();
});

When("{string} button is clicked", (buttonText: unknown) => {
  cy.contains("button", buttonText as string)
    .first()
    .click();
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
  cy.get('tds-toast[subheader="Graph has been successfully saved"]').should(
    "be.visible"
  );
});

Then("Error message should get displayed", () => {
  cy.get('tds-toast[subheader="The graph could not be saved"]').should(
    "be.visible"
  );
});

Then("Test name should get displayed", () => {
  cy.get("h3").should("be.visible").and("contain.text", "Test-Name");
});

Then("Test description should get displayed", () => {
  cy.get("p").should("be.visible").and("contain.text", "Test Description");
});

Then("Draft state should get displayed", () => {
  cy.contains("dd", "Draft").should("be.visible");
});

Then("Saved state should get displayed", () => {
  cy.contains("dd", "Saved").should("be.visible");
});

Then("Draft state should not get displayed", () => {
  cy.contains("dd", "Draft").should("not.exist");
});

Then("{string} state should {string}get displayed", (state, visibility) => {
  const shouldExist = visibility === "" ? "be.visible" : "not.exist";
  cy.contains("dd", state as string).should(shouldExist);
});

Then("Graph page should get displayed", () => {
  cy.contains("span", "Options").should("exist");
  cy.contains("span", "Save").should("exist");
});

Then("new panel should get displayed", () => {
  cy.contains("h5", "No Name").should("exist");
});

Then("label {string} should get displayed", (labelText: string) => {
  cy.contains(labelText).should("be.visible");
});

Then("{string} button should be visible", (buttonText: unknown) => {
  cy.contains("button", buttonText as string)
    .first()
    .focus();
  cy.contains("button", buttonText as string)
    .first()
    .should("be.visible");
});
