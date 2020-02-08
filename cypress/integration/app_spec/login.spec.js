/// <reference types="Cypress" />

context('Login', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('A user with a valid account can login', () => {
    cy.get('button.loginText').click()
    cy.get('[name = "email"]').type('demo@orfheo.org')
    cy.get('[name = "password"]').type('demoorfheo')
    cy.get('button.login-btn').click()
    cy.location('pathname').should('include', 'users/')
  })

})
