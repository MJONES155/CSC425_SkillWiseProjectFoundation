/// <reference types="cypress" />

describe("E2E — Create Goal Workflow", () => {
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

  it("Creates a complete goal successfully", () => {
    // Set up network intercepts BEFORE any navigation
    cy.intercept('POST', '**/api/goals').as('createGoal');
    cy.wait(1000);
    cy.intercept('GET', '**/api/goals').as('fetchGoals');

    // Go to Goals page
    cy.visit("/goals");

    // Open create goal form
    cy.contains('button', 'Create New Goal').click();

    // Fill required fields
    cy.get("[data-test=goal-title]").type("E2E Cypress Goal");
    cy.get("[data-test=goal-description]").type("This goal is created via E2E test.");

    // Optional fields
    cy.get("[data-test=goal-category]").select("programming");
    cy.get("[data-test=goal-difficulty]").select("Hard");
    cy.get("[data-test=goal-target-date]").clear().type("2024-12-31");

    // Submit form
    cy.get('[data-test=submit-goal-form]').click();
    cy.wait(1000);
    // Wait for goal creation to complete and modal to close
    cy.wait('@createGoal', { timeout: 8000 });
    cy.wait(1000);
    cy.wait('@fetchGoals', { timeout: 8000 });

    // Verify goal appears in the list (modal is now closed)
    cy.contains('[data-test=goal-title-text]', 'E2E Cypress Goal', { timeout: 10000 })
      .should('exist')
      .and('be.visible');
  });

  it("Marks a goal as completed", () => {
    // Set up network intercepts BEFORE any navigation
    cy.intercept('POST', '**/api/goals').as('createGoal');
    cy.intercept('GET', '**/api/goals').as('fetchGoals');
    cy.intercept('PUT', '**/api/goals/*').as('updateGoal');

    // Create a goal first
    cy.visit("/goals");
    cy.contains('button', 'Create New Goal').click();

    cy.get("[data-test=goal-title]").type("Goal to Complete");
    cy.get("[data-test=goal-description]").type("This goal will be marked complete.");
    cy.get("[data-test=goal-target-date]").clear().type("2024-12-31");
    cy.get("[data-test=goal-category]").select("design");
    cy.get("[data-test=submit-goal-form]").click();

    // Wait for creation and modal close
    cy.wait(1000);
    cy.wait('@createGoal', { timeout: 8000 });
    cy.wait(1000);
    cy.wait('@fetchGoals', { timeout: 8000 });

    // Verify goal exists in the list
    cy.contains('[data-test=goal-title-text]', 'Goal to Complete', { timeout: 10000 })
      .should('exist');

    // Find the goal card and click Mark Completed button within it
    cy.contains('[data-test=goal-title-text]', 'Goal to Complete')
      .parents('[data-test^=goal-card-]')
      .within(() => {
        cy.contains('button', 'Mark Completed').click();
      });

    cy.wait(1000);


    // Wait for the update to complete
    cy.wait('@updateGoal', { timeout: 8000 }).its('response.statusCode').should('eq', 200);
    cy.wait('@fetchGoals', { timeout: 8000 });

    // Verify the goal shows as completed
    cy.contains('[data-test=goal-title-text]', 'Goal to Complete')
      .parents('[data-test^=goal-card-]')
      .within(() => {
        cy.contains('Completed').should('exist');
      });
  });

});