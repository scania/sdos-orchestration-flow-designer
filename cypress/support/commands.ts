import "cypress-localstorage-commands";

Cypress.Commands.add(
  "drag",
  { prevSubject: "element" },
  (subject, targetSelector) => {
    const dataTransfer = new DataTransfer();

    cy.wrap(subject)
      .trigger("mousedown", { which: 1, dataTransfer })
      .trigger("dragstart", { dataTransfer })
      .trigger("drag", { dataTransfer });

    cy.get(targetSelector)
      .trigger("dragenter", { dataTransfer })
      .trigger("dragover", { dataTransfer })
      .trigger("drop", { dataTransfer });

    cy.wrap(subject).trigger("dragend", { dataTransfer });
  }
);
