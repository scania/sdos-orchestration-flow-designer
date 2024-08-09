import 'cypress-localstorage-commands';


Cypress.Commands.add('drag', { prevSubject: 'element' }, (subject, targetSelector) => {
  const dataTransfer = new DataTransfer();

  cy.wrap(subject)
    .trigger('mousedown', { which: 1, dataTransfer }).then(() => console.log('mousedown'))
    .trigger('dragstart', { dataTransfer }).then(() => console.log('dragstart'))
    .trigger('drag', { dataTransfer }).then(() => console.log('drag'));

  cy.get(targetSelector)
    .trigger('dragenter', { dataTransfer }).then(() => console.log('dragenter'))
    .trigger('dragover', { dataTransfer }).then(() => console.log('dragover'))
    .trigger('drop', { dataTransfer }).then(() => console.log('drop'));

  cy.wrap(subject)
    .trigger('dragend', { dataTransfer }).then(() => console.log('dragend'));
});



Cypress.Commands.add('deleteAllGraphs', () => {
  cy.get('body').then(($body) => {
    const graphs = $body.find('div[class*="card_card__tO"]');
    if (graphs.length > 0) {
      cy.get('div[class*="card_card__tO"]').each(($graph) => {
        cy.wrap($graph).within(() => {
          cy.get('.delete-button-selector').click();
        });
      });

      cy.get('div[class*="card_card__tO"]').should('not.exist');
    } else {
      cy.log('No graphs found to delete');
    }
  });
});

Cypress.Commands.add('logOff', () => {
  cy.get(".center-image").click();
  cy.get("a > :nth-child(1) > .tds-u-pl1").click();
  cy.url().should('include', '/login');
  cy.clearCookies();
  cy.clearLocalStorage();
});


