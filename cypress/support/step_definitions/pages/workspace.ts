import {Given, Then, When } from "@badeball/cypress-cucumber-preprocessor";
import '@4tw/cypress-drag-drop';

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

When( "the action button is clicked", () => {
    cy.contains('span', 'Sparql Convert Action').click({force: true, multiple: true});
});


When( "the Add to graph button is clicked", () => {
    cy.get('tds-button[text="Add to graph"] button').click({force: true, multiple: true});
});
    

// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------
// -------------------------------- THEN ----------------------------------------------
// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------

Then( "the workspace page should be visible", () => {
    cy.get('.ofd_page__header__back___Ml0u').contains("My work");
});

Then( "a new graph should open in the workspace", () => {
    cy.get('.ofd_page__header__back___Ml0u').contains("My work");
});