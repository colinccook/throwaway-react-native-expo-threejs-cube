Feature: Spinning Cube Display

  Scenario: The spinning cube is displayed on the main screen
    Given the app has loaded
    Then I should see the title "Three.js Spinning Cube"
    And I should see the spinning cube
