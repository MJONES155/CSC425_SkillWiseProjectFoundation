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

  cy.get('[data-test=firstName]').type(user.firstName);
  cy.get('[data-test=lastName]').type(user.lastName);
  cy.get('[data-test=email]').type(user.email);
  cy.get('[data-test=password]').type(user.password);
  cy.get('[data-test=confirmPassword]').type(user.password);

  cy.get('[data-test=signup-button]').click();
  // Wait until signup completes and app navigates
  cy.url({ timeout: 20000 }).should('include', '/dashboard');
  // Ensure access token is stored (authentication complete)
  cy.window().then((win) => {
    const token = win.localStorage.getItem('access_token');
    expect(token, 'access token present after signup').to.be.a('string').and.not
      .be.empty;
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
