describe('basic e2e test run', () => {
  it('should display translated content across routes', () => {
    cy.visit('/')

    // Test English content
    cy.contains('A simple example')
    cy.contains('To second page').click()
    cy.location('pathname', { timeout: 10000 }).should('equal', '/second-page')
    cy.contains('A second page')
    cy.contains('Back to home').click()
    cy.location('pathname', { timeout: 10000 }).should('equal', '/')
    cy.contains('A simple example')

    // Test German content
    cy.contains('Change locale').click()
    cy.location('pathname', { timeout: 10000 }).should('equal', '/de')
    cy.contains('Ein einfaches Beispiel')
    cy.contains('Zur zweiten Seite').click()
    cy.location('pathname', { timeout: 10000 }).should('equal', '/de/second-page')
    cy.contains('Eine zweite Seite')
    cy.contains('Zurück zur Hauptseite').click()
    cy.location('pathname', { timeout: 10000 }).should('equal', '/de')
    cy.contains('Ein einfaches Beispiel')

    cy.contains('Wechseln Locale').click()
    cy.location('pathname', { timeout: 10000 }).should('equal', '/')
    cy.contains('A simple example')
  })
})
