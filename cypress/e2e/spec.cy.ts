describe('basic e2e test run', () => {
  it('should display translated content across routes', () => {
    cy.visit('/')

    // Test English content
    cy.contains('A simple example')
    cy.contains('To second page').click()
    cy.location('pathname', { timeout: 10000 }).should(
      'equal',
      '/second-page'
    )
    cy.contains('A second page')
    cy.contains('Back to home').click()
    cy.location('pathname', { timeout: 10000 }).should('equal', '/')
    cy.contains('A simple example')
    // cy.contains('To auto static page (en)').click()
    // cy.location('pathname', { timeout: 10000 }).should(
    //   'equal',
    //   '/auto-static'
    // )
    // cy.contains('hello_en')
    // cy.contains('Back to home').click()
    // cy.location('pathname', { timeout: 10000 }).should('equal', '/')
    // cy.contains('A simple example')

    // Test German content
    cy.contains('Change locale').click()
    cy.location('pathname', { timeout: 10000 }).should(
      'equal',
      '/de'
    )
    cy.contains('Ein einfaches Beispiel')
    cy.contains('Zur zweiten Seite').click()
    cy.location('pathname', { timeout: 10000 }).should(
      'equal',
      '/de/second-page'
    )
    cy.contains('Eine zweite Seite')
    cy.contains('Zurück zur Hauptseite').click()
    cy.location('pathname', { timeout: 10000 }).should(
      'equal',
      '/de'
    )
    cy.contains('Ein einfaches Beispiel')
    // cy.contains('To auto static page (de)').click()
    // cy.location('pathname', { timeout: 10000 }).should(
    //   'equal',
    //   '/de/auto-static'
    // )
    // cy.contains('hello_de')
    // cy.contains('Zurück zur Hauptseite').click()
    // cy.location('pathname', { timeout: 10000 }).should(
    //   'equal',
    //   '/de'
    // )
    // cy.contains('Ein einfaches Beispiel')
    cy.contains('Sprache wechseln zu').click()
    cy.location('pathname', { timeout: 10000 }).should('equal', '/')
    cy.contains('A simple example')

    // Test generated version of auto static
    // cy.request('/auto-static')
    //   .its('body')
    //   .should('include', '<h2>hello_en</h2>')
    // cy.request('/de/auto-static')
    //   .its('body')
    //   .should('include', '<h2>hello_de</h2>')
  })
})
