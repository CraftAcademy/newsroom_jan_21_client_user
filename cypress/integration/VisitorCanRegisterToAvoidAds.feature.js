describe('only displays ads for un-registered users', () => {
  beforeEach(() => {
    cy.server()
    cy.route({
      method: 'GET',
      url: 'http://localhost:3000/api/articles?lat=**',
      response: 'fixture:locationList.json'
    })

    cy.visit('/', ({
      onBeforeLoad(window) {
        const stubLocation = {
          coords: {
            latitude: 55.7842,
            longitude: 12.4518
          }
        };
        cy.stub(window.navigator.geolocation, 'getCurrentPosition').callsFake(
          callback => {
            return callback(stubLocation)
          }
        )
      }
    }))
  })
  describe('successfully through registration', () => {
    beforeEach(() => {
      cy.route({
        method: 'POST',
        url: 'http://localhost:3000/api/auth',
        response: 'fixture:validatedLogin.json',
        headers: {
          uid: 'user@gmail.com'
        }
      })
    })

    it('becomes member in order to not see ads', () => {
      cy.get('[data-cy="main-ad"]').should('be.visible')

      cy.get('[data-cy="register-button"]').click()
      cy.get('[data-cy="registration-form"]').within(() => {
        cy.get('[data-cy="email-field"]').type('user@email.com')
        cy.get('[data-cy="password-field"]').type('password')
        cy.get('[data-cy="password-confirmation-field"]').type('password')
        cy.get('[data-cy="submit"]').click()
      })
      cy.get('[data-cy="main-ad"]').should('not.be.visible')
    })
  })
  describe('successfully through signing in', () => {
    beforeEach(() => {
      cy.route({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/sign_in',
        response: 'fixture:validatedLogin.json',
        headers: {
          uid: 'user@gmail.com'
        }
      })
      cy.route({
        method: 'GET',
        url: 'http://localhost:3000/api/auth/validate_token?**',
        response: 'fixture:validatedLogin.json',
        headers: {
          uid: 'user@gmail.com'
        }
      })
    })

    it('signs in to not see ad', () => {
      cy.get('[data-cy="main-ad"]').should('be.visible')
      cy.get('[data-cy="register-button"]').click()
      cy.get('[data-cy="sign-in-button"]').click()
      cy.get('[data-cy="sign-in-form"]').within(() => {
        cy.get('[data-cy="email-field"]').type('user@email.com')
        cy.get('[data-cy="password-field"]').type('password')
        cy.get('[data-cy="submit"]').click()
      })
      cy.get('[data-cy="main-ad"]').should('not.be.visible')
    })
  })

  describe('successfully through automatic validation', () => {
    beforeEach(() => {
      cy.route({
        method: 'GET',
        url: 'http://localhost:3000/api/auth/validate_token',
        response: 'fixture:validatedLogin.json',
        headers: {
          uid: 'user@gmail.com'
        }
      })
      cy.visit('/')
    })

    it('doesnt see ad when validated', () => {
      cy.get('[data-cy="main-ad"]').should('not.be.visible')
    })
  })
})