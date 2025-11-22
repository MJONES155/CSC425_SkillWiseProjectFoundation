/* eslint-env cypress */
/* global Cypress, cy */
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
Cypress.Commands.add('login', () => {
  cy.visit('/login');
  cy.get('[data-test=email]').type('test@example.com');
  cy.get('[data-test=password]').type('password123');
  cy.get('[data-test=login-button]').click();
  cy.url().should('not.include', '/login');
});

Cypress.Commands.add('signup', (user) => {
  // `user` is an object with firstName, lastName, email, password
  cy.visit('/signup');

  cy.get('[data-test=firstName]').clear().type(user.firstName);
  cy.get('[data-test=lastName]').clear().type(user.lastName);
  cy.get('[data-test=email]').clear().type(user.email);
  cy.get('[data-test=password]').clear().type(user.password);
  cy.get('[data-test=confirmPassword]').clear().type(user.password);

  // Set up intercept right before clicking to ensure it catches the request
  cy.intercept('POST', '**/api/auth/register').as('registerRequest');

  // Log what we're about to do
  cy.log('About to click signup button for:', user.email);

  cy.get('[data-test=signup-button]').should('be.visible').click();

  // Wait for either success navigation OR capture any error
  cy.wait('@registerRequest', { timeout: 10000 }).then((interception) => {
    cy.log('Register Request URL:', interception.request.url);
    cy.log('Register Status:', interception.response.statusCode);
    cy.log('Register Body:', JSON.stringify(interception.response.body));

    if (
      interception.response.statusCode >= 200 &&
      interception.response.statusCode < 300
    ) {
      // Success - wait for navigation
      cy.url({ timeout: 15000 }).should('not.match', /\/signup$/);

      // Verify token was stored
      cy.window().then((win) => {
        const token = win.localStorage.getItem('access_token');
        expect(token, 'Access token should be stored after successful signup')
          .to.exist;
      });
    } else {
      // Log the error for debugging
      cy.log('Signup failed with status:', interception.response.statusCode);
      throw new Error(
        `Signup API call failed with status ${interception.response.statusCode}`
      );
    }
  });
});

//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { /* noop placeholder */ })
