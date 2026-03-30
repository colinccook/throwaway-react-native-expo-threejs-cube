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

  Scenario: There are exactly 3 vertical navigation dots
    Given the app has loaded
    Then I should see 3 vertical navigation dots

  Scenario: The default view is the side view
    Given the app has loaded
    Then the vertical scroll position should be 0
    And the page title should show "Side view"

  Scenario: Swiping up advances to the top view
    Given the app has loaded
    When I swipe up
    Then the vertical scroll position should be greater than 0

  Scenario: The horizontal sub-dots are visible after the app loads
    Given the app has loaded
    Then I should see the horizontal sub-dots

  Scenario: The page title overlay is visible
    Given the app has loaded
    Then I should see the page title overlay

  Scenario: The horizontal sub-dots are rendered in reversed order
    Given the app has loaded
    Then the horizontal sub-dots should be in reversed cube order
