/// <reference types="Cypress" />

context('Register', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('A user can create an account', () => {
    cy.fixture('success.json').as('successJSON')
    cy.server()
    cy.route('POST', '/login/register', '@successJSON').as('register')

    cy.get('button.signUpHeader-welcomePage').click()
    cy.get('.popup-content [type = "text"]').type('test@test.test')
    cy.get('.popup-content [type = "password"]').each($input => $input.val('123456789'))
    cy.get('#accept-condition-cbx').click()

    cy.get('.popup-content button.signup-form-btn').should('be.enabled')


    cy.get('.popup-content button.signup-form-btn').click()
    cy.get('.popup-content').should('contain', 'sent you a link to')
  
  })

})
