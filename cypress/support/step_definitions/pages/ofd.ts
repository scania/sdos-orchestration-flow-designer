import { When, Given, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("OFD page is in view", () => {
  cy.visit("/ofd/test");
  cy.get("body").should("contain.text", "Library");
});

Then("task node should be visible", () => {
  cy.get(" .react-flow__node.react-flow__node-input.nopan.selectable")
    .should("be.visible")
    .should("contain.text", "Task");
});

Then("Primary Mode classes should be visible", () => {
  cy.contains('div[draggable="true"] span', "HTTP Action").should("exist");
});

When("Navigated to Parameters Tab", () => {
  cy.contains("li", "Parameters").click({ force: true });
});

Then("Parameters classes should be present", () => {
  cy.contains('div[draggable="true"] span', "Standard Parameter").should(
    "exist"
  );
});

When("Navigated to Scripts Tab", () => {
  cy.contains("li", "Scripts").click({ force: true });
});

Then("Script classes should be present", () => {
  cy.contains('div[draggable="true"] span', "Groovy Script").should("exist");
});

When("a partial class name containing ttp is typed in the search field", () => {
  cy.get(".text-field-input").clear().type("ttp");
});

Then("HTTP Action should appear in the list regardless of tab", () => {
  cy.contains('div[draggable="true"] span', "HTTP Action").should("exist");
});

When("a partial class name containing ult is typed in the search field", () => {
  cy.get(".text-field-input").clear().type("ult");
});

Then("Result Action should appear in the list regardless of Tab", () => {
  cy.contains('div[draggable="true"] span', "Result Action").should("exist");
});

When(
  "HTTP Action class in dragged and dropped from the sidebar to the canvas",
  () => {
    cy.contains('div[draggable="true"]', "HTTP Action").then(($el) => {
      const coords = $el[0].getBoundingClientRect();
      cy.log(`Element initial position: (${coords.left}, ${coords.top})`);

      cy.wrap($el)
        .trigger("mousedown")
        .trigger("mousemove", {
          clientX: coords.left + 5,
          clientY: coords.top + 5,
        })
        .trigger("mousemove", { pageX: 883, pageY: 571 })
        .trigger("mouseup", { force: true });

      cy.log("Drag and drop action performed");

      // Verify the element has moved to the target location
      cy.get(".target-container").should("contain.text", "HTTP Action");
    });
  }
);
