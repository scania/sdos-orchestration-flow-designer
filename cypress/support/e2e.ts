/*  
    This file is executed before each spec-file.
    Here we:
    * define reusable code to be used in several tests
    * import plugins
    * define before- and beforeEach-hooks
*/

import 'cypress-mochawesome-reporter/register';

beforeEach(() => {
    loginViaAAD(Cypress.env('username'), Cypress.env('password'));
    cy.visit('/');
});

function loginViaAAD(username: string, password: string) {
    cy.session("auto_OFD Test", () => {
        cy.visit('/');
        cy.get('button').contains('Sign in').click();
        cy.origin(
            'login.microsoftonline.com',
            {
                args: {
                    username,
                    password
                }
            },
            ({ username, password }) => {
                cy.get('input[type="email"]').type(username + '{enter}', { log: false });
                cy.get('input[type="password"]').type(password, { log: false });
                cy.get('input[type="submit"]').click();
            }
        );
        
    },
    {
        validate() {
            cy.visit('/');
            cy.get('button').contains('Sign in').click();
            cy.get('h2').contains('My Work').should('be.visible');
        }
    });
    
};