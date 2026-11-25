@admin-courses
Feature: Administrator-only course management
  Administrators can view and manage courses.
  Other callers must not read the management catalogue or change courses.

  Background:
    Given an isolated tutorial platform with an existing course and video

  @BDD-ADM-01
  Scenario: An administrator can view the unpublished course catalogue
    Given I am an "admin"
    When I attempt to "view" a course
    Then the response status should be 200
    And the management catalogue should include the existing unpublished course

  @BDD-ADM-02
  Scenario: An administrator can create a course
    Given I am an "admin"
    When I attempt to "create" a course
    Then the response status should be 200
    And the created course should be returned and saved in the isolated catalogue

  @BDD-ADM-03
  Scenario: An administrator can edit a course
    Given I am an "admin"
    When I attempt to "edit" a course
    Then the response status should be 200
    And the existing course should have the requested title

  @BDD-ADM-04
  Scenario: An administrator can delete a course
    Given I am an "admin"
    When I attempt to "delete" a course
    Then the response status should be 200
    And the existing course should be removed from the isolated catalogue

  Scenario Outline: A <actor> cannot <operation> courses
    Given I am a "<actor>"
    When I attempt to "<operation>" a course
    Then the response status should be <status>
    And the response error should be "<error>"
    And the course catalogue should match its initial state
    And no course management query should reach the repository

    @BDD-ADM-GUEST
    Examples: Guests
      | actor | operation | status | error                                   |
      | guest | view      | 401    | Missing or invalid authorization header |
      | guest | create    | 401    | Missing or invalid authorization header |
      | guest | edit      | 401    | Missing or invalid authorization header |
      | guest | delete    | 401    | Missing or invalid authorization header |

    @BDD-ADM-STUDENT
    Examples: Authenticated students
      | actor   | operation | status | error                            |
      | student | view      | 403    | Forbidden: Admin access required |
      | student | create    | 403    | Forbidden: Admin access required |
      | student | edit      | 403    | Forbidden: Admin access required |
      | student | delete    | 403    | Forbidden: Admin access required |

    @BDD-ADM-INVALID
    Examples: Invalid identities
      | actor            | operation | status | error                       |
      | invalid identity | view      | 401    | Unauthorized: Invalid token |
      | invalid identity | create    | 401    | Unauthorized: Invalid token |
      | invalid identity | edit      | 401    | Unauthorized: Invalid token |
      | invalid identity | delete    | 401    | Unauthorized: Invalid token |

  @BDD-ADM-FAILURE
  Scenario Outline: A repository failure does not report a successful <operation>
    Given I am an "admin"
    And the course repository will fail the "<operation>" operation
    When I attempt to "<operation>" a course
    Then the response status should be 500
    And the response error should be "<error>"
    And the course catalogue should match its initial state

    Examples:
      | operation | error                    |
      | view      | Failed to fetch courses  |
      | create    | Failed to create course  |
      | edit      | Failed to update course  |
      | delete    | Failed to delete course  |

