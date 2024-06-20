import { Given, Then, When } from "@badeball/cypress-cucumber-preprocessor";

// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------
// -------------------------------- GIVEN ---------------------------------------------
// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------

Given( "the settings page is in view", () => {
    cy.visit("/settings");
    cy.get("h1").should("contain.text", "Settings");
});


Given( "the {string} mode is active", (theme: string) => {    

    if (theme == "dark") {
        cy.get("body").then(($body) => {
            if ( !$body.find(".tds-mode-dark").length ) {
                cy.get("div.mode-switcher > tds-toggle > div > input").uncheck({force: true});
            }        
        });

    } else if (theme == "light") {
        cy.get("body").then(($body) => {
            if ( !$body.find(".tds-mode-light").length ) {
                cy.get("div.mode-switcher > tds-toggle > div > input").check({force: true});
            }        
        });
    }
});

// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------
// -------------------------------- WHEN ----------------------------------------------
// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------

When( "the settings button is clicked", () => {
    cy.get("tds-icon[name='settings']").click({force: true, multiple: true});
});


When( "light mode is toggled", () => {
    cy.get("div.mode-switcher > tds-toggle > div > input").check({force: true});
});


When( "dark mode is toggled", () => {
    cy.get("div.mode-switcher > tds-toggle > div > input").uncheck({force: true});
});

When( "home button is clicked", () => {
    cy.get('[title-text="Pages"] > :nth-child(1) > a').click({force: true, multiple: true});
});


// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------
// -------------------------------- THEN ----------------------------------------------
// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------

Then( "the settings button should be visible", () => {
    cy.get(".tds-header-component-list > :nth-child(4) > div > a > tds-icon[name='settings']")
    .should("be.visible");
});


Then( "the settings page should be in view", () => {
    cy.contains('h1', 'Settings').should("exist");
});


Then("the {string} mode should be active", (theme: string) => {
    cy.get("body").should("contain.html", "tds-mode-" + theme);
});

  