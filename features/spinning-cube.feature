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

  Scenario: The horizontal sub-dots are rendered in normal order
    Given the app has loaded
    Then the horizontal sub-dots should be in normal cube order

  Scenario: The page title uses a sci-fi font class
    Given the app has loaded
    Then the page title slides should exist for sci-fi styling

  Scenario: The active navigation dot has the strobing class
    Given the app has loaded
    Then the active dot should have the active modifier class

  Scenario: Swipe sounds are triggered during drag gestures
    Given the app has loaded
    When I begin a swipe gesture
    Then the swipe sound functions should have been called

  Scenario: A quick fling gesture advances the page without large movement
    Given the app has loaded
    When I perform a quick fling upward
    Then the vertical scroll position should be greater than 0
