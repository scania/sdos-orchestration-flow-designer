describe("Api testing", () => {
  it("fetches list of Classes used in OFD", () => {
    cy.request("/api/classes").then((response) => {
      expect(response.status).to.eq(200);
    });
  });

  it("Checks for parsing shacl", () => {
    cy.request("/api/parse-ttl/?className=HTTPAction").then((response) => {
      expect(response.status).to.eq(200);
    });
  });
});
