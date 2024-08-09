Feature: Settings
    @skip
    Scenario: Toggle light mode
        Given the settings page is in view
        And the "dark" mode is active
        When light mode is toggled
        Then the "light" mode should be active
    @skip
    Scenario: Toggle dark mode
        Given the settings page is in view
        And the "light" mode is active
        When dark mode is toggled
        Then the "dark" mode should be active


    