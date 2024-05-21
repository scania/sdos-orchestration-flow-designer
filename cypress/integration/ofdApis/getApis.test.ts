describe('Api testing', () => {

    it("fetches list of Classes used in OFD", () => {
      cy.request("http://localhost:3000/api/classes").then((response) => {
        expect(response.status).to.eq(200)
      })
    })

    it("Checks for parsing shacl", () => {
        cy.request("http://localhost:3000/api/parse-ttl/?className=HTTPAction").then((response) => {
          expect(response.status).to.eq(200)
        })
      })


  })