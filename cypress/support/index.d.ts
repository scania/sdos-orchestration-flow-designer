
declare namespace Cypress {
    interface Chainable<Subject = any> {
      /**
       * Custom command to drag an element to a target element.
       * @example cy.get('selector').drag('targetSelector')
       */
      drag(targetSelector: string): Chainable<Subject>;
  }
}