Feature: Create new orchestration graph

    Scenario: Create new graph using drop and drop
        Given OFD home page is in view
        When the button "Create new graph" is clicked
        Then the create new graph modal is visible
        Given "Test Name" is entered in the text field with placeholder "Name"
        And "Test Description" is entered in the text area with placeholder "Description"
        When the modal's create button is clicked
        Then the workspace page should be visible
        And a new graph should open in the workspace
        When the action button is dragged
        And the connector is linked
        And Save button is clicked
        Then Success message should get displayed

    Scenario: Features of Create new graph page
        Given OFD home page is in view
        When the button "Create new graph" is clicked
        Then the create new graph modal is visible
        Given "Test Name" is entered in the text field with placeholder "Name"
        And "Test Description" is entered in the text area with placeholder "Description"
        When the modal's create button is clicked
        Then the workspace page should be visible
        And a new graph should open in the workspace
        And the elements in workspace gets displayed

    Scenario: Create new graph using Add to graph
        Given OFD home page is in view
        When the button "Create new graph" is clicked
        Then the create new graph modal is visible
        Given "Test Name" is entered in the text field with placeholder "Name"
        And "Test Description" is entered in the text area with placeholder "Description"
        When the modal's create button is clicked
        Then the workspace page should be visible
        And a new graph should open in the workspace
        When the action button is clicked
        And the Add to graph button is clicked
        And the action button is dragged
        And the connector is linked
        And Save button is clicked
        Then Success message should get displayed


