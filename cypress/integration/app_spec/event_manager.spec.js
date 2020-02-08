context('E-Manager', () => {
  before(() => {
      cy.login('demo@orfheo.org', 'demoorfheo')
      cy.visit('/event_manager?id=d468f805-e481-4092-8134-066edb6ed018')
    })

    it('An organizer can open a popup containing a proposal clicking on the title', () => {
      cy.get('.table-proposal td a:first').click()
      cy.get('body')
        .should('have.class', 'is-reveal-open')
    })

    it('An organizer can modify a proposal ', () => {
      const modifyText = 'otter'
      const regExpMatch = new RegExp(modifyText)

      cy.get('.popup-content .element-actionButton:nth-child(2)').click()
      cy.get('.popup-form .call-form-field input:enabled:first').clear().type(modifyText)

      cy.server()
      cy.route('POST','/users/modify_space_proposal').as('modifySpaceProposal')
      cy.route('POST','/users/modify_artist_proposal').as('modifyArtistProposal')
      
      cy.get('.submit-button').click() 
      cy.wait('@modifySpaceProposal')

      cy.get('@modifySpaceProposal').then(function (xhr) {
        expect(xhr.status).to.eq(200)
        expect(xhr.requestBody).to.match(regExpMatch)
      })     
    })

})
