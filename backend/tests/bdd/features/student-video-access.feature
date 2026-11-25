@video-access
Feature: Student access to a course video
  Students may receive a video link only when authenticated, paid and enrolled
  in the video's course. Administrators may preview videos without enrollment.

  Background:
    Given an isolated tutorial platform with an existing course and video

  @BDD-VID-01
  Scenario: A guest cannot obtain a video link
    Given I am a "guest"
    When I request the course video
    Then the response status should be 401
    And the response error should be "Missing or invalid authorization header"
    And the private video link should not be disclosed

  @BDD-VID-02
  Scenario: An invalid identity cannot obtain a video link
    Given I am an "invalid identity"
    When I request the course video
    Then the response status should be 401
    And the response error should be "Unauthorized: Invalid token"
    And the private video link should not be disclosed

  @BDD-VID-03
  Scenario: A paid enrolled student can access the video
    Given I am a "student"
    And my payment status is "paid"
    And I am enrolled in the video's course
    When I request the course video
    Then the response status should be 200
    And I should receive only the permitted video details

  Scenario Outline: An unpaid student is denied even when enrollment is <enrollment>
    Given I am a "student"
    And my payment status is "unpaid"
    And my enrollment in the video's course is "<enrollment>"
    When I request the course video
    Then the response status should be 403
    And the response error should be "Forbidden: User has not paid"
    And the private video link should not be disclosed

    @BDD-VID-04
    Examples: Enrolled but unpaid
      | enrollment |
      | present    |

    @BDD-VID-05
    Examples: Neither paid nor enrolled
      | enrollment |
      | absent     |

  @BDD-VID-06
  Scenario: Payment alone does not grant course access
    Given I am a "student"
    And my payment status is "paid"
    And my enrollment in the video's course is "absent"
    When I request the course video
    Then the response status should be 403
    And the response error should be "Forbidden: Not enrolled in this course"
    And the private video link should not be disclosed

  Scenario Outline: An enrollment for <owner> does not grant this access
    Given I am a "student"
    And my payment status is "paid"
    And the only enrollment belongs to "<owner>"
    When I request the course video
    Then the response status should be 403
    And the response error should be "Forbidden: Not enrolled in this course"
    And the private video link should not be disclosed

    @BDD-VID-07
    Examples: Wrong course
      | owner          |
      | another course |

    @BDD-VID-08
    Examples: Wrong student
      | owner           |
      | another student |

  @BDD-VID-09
  Scenario: An administrator may preview without payment or enrollment
    Given I am an "admin"
    And my payment status is "unpaid"
    And my enrollment in the video's course is "absent"
    When I request the course video
    Then the response status should be 200
    And I should receive only the permitted video details

  @BDD-VID-10
  Scenario: A paid student receives a clear error for a missing video
    Given I am a "student"
    And my payment status is "paid"
    And I am enrolled in the video's course
    When I request a video that does not exist
    Then the response status should be 404
    And the response error should be "Video not found"
    And the private video link should not be disclosed

