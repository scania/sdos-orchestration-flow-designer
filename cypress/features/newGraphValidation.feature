Feature:  orchestration graph validation

    Background: Open dialogue for creating new graph
        Given OFD home page is in view
        When the button "Create new graph" is clicked
        Then the create new graph modal is visible

    
    Scenario: Create new graph
        Given "Test Name" is entered in the text field with placeholder "Name"
        And "Test Description" is entered in the text area with placeholder "Description"
        When the modal's create button is clicked
        Then the workspace page should be visible
        And a new graph should open in the workspace

    Scenario: Test Description field left blank
        Given "Test Name" is entered in the text field with placeholder "Name"
        And the modal's create button is clicked
        Then the workspace page should be visible
        And a new graph should open in the workspace

    Scenario: Test Name field left blank
        Given the text field with placeholder "Name" is cleared 
        And "Test Description" is entered in the text area with placeholder "Description"
        When the modal's create button is clicked
        Then the modal should display an error message saying "graph name is required"

    Scenario: Abort dialogue
        Given "Test Name" is entered in the text field with placeholder "Name"
        And "Test Description" is entered in the text area with placeholder "Description"
        When the modal's close button is clicked
        Then the modal should not be visible

    

        
