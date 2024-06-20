
describe('Azure AD Authentication and Authorization', () => {
    
const clientId = Cypress.env("SDOS_AZURE_AD_CLIENT_ID");
const clientSecret = Cypress.env("SDOS_AZURE_AD_CLIENT_SECRET");
const tenantId = Cypress.env("OFD_AZURE_AD_TENANT_ID");
const authorityUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
const runOrchestrationUrl = 'https://sdos.sdip.devtest.aws.scania.com/sdos/runOrchestration';
const runorchestrationSyncUrl='https://sdos.sdip.devtest.aws.scania.com/sdos/runOrchestrationSync';
const getAllAvailableTasksUrl='https://sdos.sdip.devtest.aws.scania.com/sdos/getAllAvailableTasks';
const scope= `openid api://${clientId}/offline_access`;
const username = Cypress.env("TEST_USERNAME");
const password = Cypress.env("TEST_PASSWORD");
const bodyparams={
    "subjectIri": "https://kg.scania.com/it/iris_orchestration/OWLNamedIndividual_a65f0c37_d8df_4c0a_b8d3_814c94c2d66b",
    "parameters": [{
            "label": "param_pizza_size",
            "keyValuePairs": [{
                    "key": "size",
                    "value": "30cm"
                }
            ]
        }, {
            "label": "param_allergenes_credential",
            "keyValuePairs": [{
                    "key": "username",
                    "value": "testuser"
                }, {
                    "key": "password",
                    "value": "welcome123"
                }
            ]
        }, {
            "label": "param_pizza_credential",
            "keyValuePairs": [{
                    "key": "username",
                    "value": "testuser"
                }, {
                    "key": "password",
                    "value": "welcome123"
                }
            ]
        }, {
            "label": "param_itemId",
            "keyValuePairs": [{
                    "key": "itemId",
                    "value": "57625634"
                }
            ]
        }, {
            "label": "param_stardog_credential",
            "keyValuePairs": [{
                    "key": "username",
                    "value": "test-user"
                }, {
                    "key": "password",
                    "value": "test_@user"
                }
            ]
        }
    ]
}
    let accessToken;

    it('should authenticate with Azure AD and get an access token', () => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.request({
            method: 'POST',
            url: authorityUrl,
            form: true,
            body: {
                client_id: clientId,
                client_secret: clientSecret,
                scope: scope,
                //client_credentials
                grant_type: 'password',
                username: username,
                password:password
            }
        }).then(response => {
            expect(response.status).to.eq(200);
            accessToken = response.body.access_token;
            expect(accessToken).to.not.be.empty;
        });
    });

    it('should check run orchestration Api ', () => {
        cy.request({
            method: 'POST',
            url: runorchestrationSyncUrl,
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
           // failOnStatusCode: false,
            body: bodyparams
        }).then(response => {
            expect(response.status).to.eq(200);
            // Add additional checks for the response body as needed
        });
    });

    it('should check run Orchestration Sync Api ', () => {
        cy.request({
            method: 'POST',
            url: runorchestrationSyncUrl,
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
           // failOnStatusCode: false,
            body: bodyparams
        }).then(response => {
            expect(response.status).to.eq(200);
            // Add additional checks for the response body as needed
        });
    });

    it('should check getAllAvailableTasks Api ', () => {
        cy.request({
            method: 'GET',
            url: getAllAvailableTasksUrl,
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
           // failOnStatusCode: false,
            body: {}
        }).then(response => {
            expect(response.status).to.eq(200);
            // Add additional checks for the response body as needed
        });
    });
});
