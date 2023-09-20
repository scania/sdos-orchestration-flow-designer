
@smoke
Feature: Smoke tests

    Scenario: Header
        Given OFD home page is in view
        Then the search button should be visible
        And the settings button should be visible
        And the menu button should be visible
        And the profile button should be visible
        And the home button should be visible

    Scenario: Settings page
        Given OFD home page is in view
        When the settings button is clicked
        Then the settings page should be in view