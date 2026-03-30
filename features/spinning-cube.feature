Feature: Three Rotating Cubes with Swipable Views

  Scenario: The three-scene canvas fills the entire screen
    Given the app has loaded
    Then the app container should fill the full screen
    And I should see the three-scene canvas

  Scenario: An FPS counter is visible in the top-left corner
    Given the app has loaded
    Then I should see the FPS counter

  Scenario: Navigation dots are visible on the right
    Given the app has loaded
    Then I should see the navigation dots

  Scenario: The default view is the perspective view
    Given the app has loaded
    Then the vertical scroll position should be 0

  Scenario: Swiping down advances to the top-down view
    Given the app has loaded
    When I swipe down
    Then the vertical scroll position should be greater than 0

  Scenario: On the cube-focus page the horizontal sub-dots are shown
    Given the app has loaded
    Then I should see the horizontal sub-dots
