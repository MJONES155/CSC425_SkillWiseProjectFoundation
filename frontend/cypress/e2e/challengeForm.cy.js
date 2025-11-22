/// <reference types="cypress" />

describe("E2E — Create Challenge Workflow", () => {
  beforeEach(() => {
    cy.visit("/signup");
    // Sign up a fresh test user each time
    const user = {
      firstName: "Test",
      lastName: "User",
      email: `testuser+${Date.now()}@example.com`, // ensures unique email
      password: "Password123",
    };

    cy.signup(user); 
    cy.wait(1000);
    
  });

  it("Creates a challenge linked to a newly created goal", () => {
    // First create a goal to link
    const goalTitle = `E2E Goal ${Date.now()}`;
    cy.visit('/goals');
    cy.contains('button', 'Create New Goal').click();
    cy.get('[data-test=goal-title]').type(goalTitle);
    cy.get('[data-test=goal-description]').type('Goal for linking in challenge test');
    cy.get('[data-test=goal-category]').select('programming');
    cy.get('[data-test=goal-difficulty]').select('Medium');
    cy.get('[data-test=submit-goal-form]').click();

    cy.wait(1000);

    cy.contains(goalTitle, { timeout: 8000 }).should('exist');

    // Go to Challenges page
    const challengeTitle = `E2E Challenge ${Date.now()}`;
    cy.visit('/challenges');

    // Open create challenge form (button doesn't have data-test, use text)
    cy.contains('button', 'Create New Challenge').click();

    // Fill required fields
    cy.get('[data-test=challenge-title]').type(challengeTitle);
    cy.get('[data-test=challenge-description]').type('Created via E2E test');
    cy.get('[data-test=challenge-instructions]').type('Follow all steps carefully.');

    // Optional fields
    cy.get('[data-test=challenge-category]').select('programming');
    cy.get('[data-test=challenge-difficulty]').select('Medium');
    cy.get('[data-test=challenge-estimated-time]').clear().type('45');
    cy.get('[data-test=challenge-points-reward]').clear().type('20');
    cy.get('[data-test=challenge-max-attempts]').clear().type('3');

    // Link to the goal we just created (by title)
    cy.get('[data-test=challenge-goal]').select(goalTitle);

    // Submit form (button has class, not data-test; use text or form submit)
    cy.get('form').within(() => {
      cy.get('button.btn-primary').contains(/create challenge/i).click();
    });

    cy.wait(1000);

    // Verify the challenge appears and shows a link to the goal
    cy.contains(challengeTitle, { timeout: 8000 }).should('exist');
    cy.contains('View Goal').should('exist');
  });

  it("Marks a challenge as completed", () => {
    // First create a goal to link
    const goalTitle = `E2E Goal for Completion ${Date.now()}`;
    cy.visit('/goals');
    
    cy.intercept('POST', '**/api/goals').as('createGoal');
    cy.intercept('GET', '**/api/goals').as('fetchGoals');
    cy.intercept('POST', '**/api/challenges').as('createChallenge');
    cy.intercept('GET', '**/api/challenges').as('fetchChallenges');
    cy.intercept('POST', '**/api/challenges/*/complete').as('completeChallenge');
    
    cy.contains('button', 'Create New Goal').click();
    cy.get('[data-test=goal-title]').type(goalTitle);
    cy.get('[data-test=goal-description]').type('Goal for completion test');
    cy.get('[data-test=submit-goal-form]').click();

    cy.wait(1000);
    
    cy.wait('@createGoal', { timeout: 8000 });
    cy.wait('@fetchGoals', { timeout: 8000 });
    
    cy.contains(goalTitle, { timeout: 8000 }).should('exist');

    // Create a challenge linked to that goal
    const challengeTitle = `Challenge to Complete ${Date.now()}`;
    cy.visit('/challenges');
    cy.contains('button', 'Create New Challenge').click();

    cy.get('[data-test=challenge-title]').type(challengeTitle);
    cy.get('[data-test=challenge-description]').type('This challenge will be completed');
    cy.get('[data-test=challenge-instructions]').type('Complete all steps.');
    cy.get('[data-test=challenge-goal]').select(goalTitle);
    cy.get('[data-test=challenge-category]').select('design');

    cy.get('form').within(() => {
      cy.get('button.btn-primary').contains(/create challenge/i).click();
    });

    cy.wait(1000);

    cy.wait('@createChallenge', { timeout: 8000 });
    cy.wait('@fetchChallenges', { timeout: 8000 });

    // Find the challenge card and click Mark Complete button
    cy.contains('[data-test^=challenge-card-]', challengeTitle, { timeout: 10000 })
      .should('exist')
      .within(() => {
        cy.get('[data-test=challenge-mark-complete-btn]').click();
      });

    cy.wait(1000);

    // Wait for completion
    cy.wait('@completeChallenge', { timeout: 8000 }).its('response.statusCode').should('eq', 200);
    cy.wait('@fetchChallenges', { timeout: 8000 });

    cy.wait(1000);

    // Verify challenge shows as completed
    cy.contains('[data-test^=challenge-card-]', challengeTitle).within(() => {
      cy.contains('completed').should('exist');
    });
  });

  // Additional prerequisite behaviors can be tested after test data builders exist

  // it('Auto-removes prerequisites when goal changes', () => {
  //   // Requires seeded data for multiple goals and prerequisite challenges
  // });

  it('Allows cancel action', () => {
    cy.visit('/challenges');
    cy.contains('button', 'Create New Challenge').click();
    cy.get('[data-test=challenge-title]').type('Cancel Test');
    cy.contains('button', /cancel/i).click();
    cy.wait(1000);

    cy.url().should('include', '/challenges');
    cy.get('[data-test=challenge-title]').should('not.exist');
  });
});
