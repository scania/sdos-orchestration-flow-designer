Feature: Navigation

Scenario: home button in settings page
        Given OFD home page is in view 
        And the settings button is clicked
        And the settings page should be in view
        When home button is clicked
        Then OFD home page is in view 

Scenario: 'My work' icon in workspace page
        Given OFD home page is in view
        When the button "Create new graph" is clicked
        Then the create new graph modal is visible
        Given "Test Name" is entered in the text field with placeholder "Name"
        And "Test Description" is entered in the text area with placeholder "Description"
        When the modal's create button is clicked
        Then the workspace page should be visible
        And a new graph should open in the workspace
        When the My work icon is clicked
        Then OFD home page is in view 