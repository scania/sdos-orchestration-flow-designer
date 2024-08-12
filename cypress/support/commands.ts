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



