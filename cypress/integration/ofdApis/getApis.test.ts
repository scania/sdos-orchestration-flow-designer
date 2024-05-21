describe("Api testing", () => {
  const expectedJsonParseSHACL = {
    className: "HTTPAction",
    subClassOf: "https://kg.scania.com/it/iris_orchestration/Action",
    objectProperties: [
      {
        shape: "https://kg.scania.com/it/iris_orchestration/hasNextActionShape",
        path: "https://kg.scania.com/it/iris_orchestration/hasNextAction",
        className: "https://kg.scania.com/it/iris_orchestration/Action",
        subClasses: [
          "https://kg.scania.com/it/iris_orchestration/HTTPAction",
          "https://kg.scania.com/it/iris_orchestration/ResultAction",
          "https://kg.scania.com/it/iris_orchestration/SOAPAction",
          "https://kg.scania.com/it/iris_orchestration/ScriptAction",
          "https://kg.scania.com/it/iris_orchestration/SparqlConvertAction",
          "https://kg.scania.com/it/iris_orchestration/VirtualGraphAction",
        ],
        minCount: 1,
      },
      {
        shape:
          "https://kg.scania.com/it/iris_orchestration/inputParameterShape_optional",
        path: "https://kg.scania.com/it/iris_orchestration/inputParameter",
        className: "https://kg.scania.com/it/iris_orchestration/Parameter",
        subClasses: [
          "https://kg.scania.com/it/iris_orchestration/BasicCredentialsParameter",
          "https://kg.scania.com/it/iris_orchestration/HTTPParameter",
          "https://kg.scania.com/it/iris_orchestration/StandardParameter",
          "https://kg.scania.com/it/iris_orchestration/TokenCredentialsParameter",
        ],
        minCount: 0,
      },
      {
        shape:
          "https://kg.scania.com/it/iris_orchestration/outputParameterShape_optional",
        path: "https://kg.scania.com/it/iris_orchestration/outputParameter",
        className: "https://kg.scania.com/it/iris_orchestration/Parameter",
        subClasses: [
          "https://kg.scania.com/it/iris_orchestration/BasicCredentialsParameter",
          "https://kg.scania.com/it/iris_orchestration/HTTPParameter",
          "https://kg.scania.com/it/iris_orchestration/StandardParameter",
          "https://kg.scania.com/it/iris_orchestration/TokenCredentialsParameter",
        ],
        minCount: 0,
      },
      {
        shape: "https://kg.scania.com/it/iris_orchestration/hasSystemShape",
        path: "https://kg.scania.com/it/iris_orchestration/hasSystem",
        className: "https://kg.scania.com/it/iris_orchestration/System",
        subClasses: [],
        minCount: 1,
        maxCount: 1,
      },
      {
        shape: "https://kg.scania.com/it/iris_orchestration/hasConnectorShape",
        path: "https://kg.scania.com/it/iris_orchestration/hasConnector",
        className: "https://kg.scania.com/it/iris_orchestration/Connector",
        subClasses: [
          "https://kg.scania.com/it/iris_orchestration/HTTPConnector",
          "https://kg.scania.com/it/iris_orchestration/KafkaConnector",
          "https://kg.scania.com/it/iris_orchestration/SOAPConnector",
        ],
        minCount: 1,
        maxCount: 1,
      },
    ],
    formFields: [
      {
        name: "https://kg.scania.com/it/iris_orchestration/label",
        type: "text",
        label: "Label",
        value: "",
        validation: {
          required: true,
          minLength: 1,
          maxLength: 50,
          message: "Label must be a string with 1 to 50 characters",
        },
      },
      {
        name: "https://kg.scania.com/it/iris_orchestration/httpHeader",
        type: "text",
        label: "HTTP Header should be a string",
        value: "",
        validation: {
          max: 1,
        },
      },
      {
        name: "https://kg.scania.com/it/iris_orchestration/httpQueryParameter",
        type: "text",
        label: "HTTP Parameter should be a string",
        value: "",
        validation: {
          max: 1,
        },
      },
      {
        name: "https://kg.scania.com/it/iris_orchestration/endpoint",
        type: "text",
        label: "endpoint should be string and start with '/'",
        value: "",
        validation: {
          min: 1,
          max: 1,
          pattern: "^/",
          required: true,
        },
      },
    ],
  };

  it("fetches list of Classes used in OFD", () => {
    cy.request("/api/classes").then((response) => {
      expect(response.status).to.eq(200);
    });
  });

  it("Checks for parsing shacl", () => {
    cy.request("/api/parse-ttl/?className=HTTPAction").then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.deep.equal(expectedJsonParseSHACL);
    });
  });
});
