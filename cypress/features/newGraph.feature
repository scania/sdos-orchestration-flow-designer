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

    
    Scenario: Created Graph gets reflected in My Work Page
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
        When the My work icon is clicked
        Then OFD home page is in view
        And Test name should get displayed
        And Test description should get displayed
        And Delete Button should get displayed
        And Open Button should get displayed

      
    Scenario: Save as Draft new graph using drop and drop
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
        And Save Draft button is clicked
        Then Success message should get displayed
        When the My work icon is clicked
        Then OFD home page is in view
        And Test name should get displayed
        And Draft state should get displayed

    Scenario: Open Draft graph and Save
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
        And Save Draft button is clicked
        Then Success message should get displayed
        When the My work icon is clicked
        Then OFD home page is in view
        And Test name should get displayed
        And Draft state should get displayed
        And Open Button should get displayed
        When Open Button is clicked
        Then Graph page should get displayed
        When Save button is clicked
        Then Success message should get displayed
        When the My work icon is clicked
        Then OFD home page is in view
        And Test name should get displayed
        And Saved state should get displayed
        And Draft state should not get displayed


