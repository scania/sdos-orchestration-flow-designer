
Feature: OFD

    Scenario: Default Task Node
        Given OFD page is in view
        Then task node should be visible 
    

    Scenario: Classes Loading Successfully and Default Task Node is present
        Given OFD page is in view
        Then task node should be visible 
        Then Primary Mode classes should be visible
        When Navigated to Parameters Tab
        Then Parameters classes should be present 
        When Navigated to Scripts Tab
        Then Script classes should be present 

    Scenario: Classes are searchable in the sidebar 
        Given OFD page is in view
        When a partial class name containing ttp is typed in the search field
        Then HTTP Action should appear in the list regardless of tab
        When a partial class name containing ult is typed in the search field
        Then Result Action should appear in the list regardless of Tab

   # Scenario: Drag and Drop Http Action to the canvas
        #Given OFD page is in view
        #When HTTP Action class in dragged and dropped from the sidebar to the canvas
        #Then HTTP Action should be visible in the canvas

#    Scenario: Connect Task node with Http Action
        #Given OFD page is in view
        #Then HTTP Action class in dragged and dropped from the sidebar to the canvas
        #When Task Node is connected with Http Action
        #Then connection should be made and the connector name should be hasAction

