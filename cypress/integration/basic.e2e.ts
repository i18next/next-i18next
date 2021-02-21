describe('basic e2e test run', () => {
  it('should display translated content across routes', () => {
    cy.visit('/')

    // Test English content
    cy.contains('A simple example')
    cy.contains('To second page').click()
    cy.contains('A second page')
    cy.contains('Back to home').click()
    cy.contains('A simple example')

    // Test German content
    cy.contains('Change locale').click()
    cy.contains('Ein einfaches Beispiel')
    cy.contains('Zur zweiten Seite').click()
    cy.contains('Eine zweite Seite')
    cy.contains('Zurück zur Hauptseite').click()
    cy.contains('Ein einfaches Beispiel')

    cy.contains('Wechseln Locale')
    cy.contains('A simple example')
  })
})
