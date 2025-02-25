import { test, expect } from '@playwright/test';
import { 
    loginUser, 
    createGraph,
    saveDraftGraph, 
    saveGraphToStardog,
    deleteGraph,
    navigateToGraph,
    addComponentTograph
} from './common';
import path from 'path';


test.describe('test JsonLdContext component', () => {

    test.beforeEach('Log in test user', async ({ page }) => {
        await loginUser(page);
    });

    test('Add context manually', async ({ page }) => {
        const graphName = 'AUTOTEST Context Manual';
        await createGraph(page, graphName);
        // Add JsonLdContext component to graph
        await addComponentTograph(page, 'Script Action', 400, -100);
        await page.locator('.react-flow__node').getByText('Script Action').click();
        await page.getByRole('button', { name: 'Enter Setup' }).click();
        await page.getByText('Optional (1)').click();
        await addComponentTograph(page, 'JsonLdContext', 500, 100);
        await page.locator('.react-flow__node').getByText('JsonLdContext').last().click();

        await page.getByRole('textbox', { name: 'context should be a string,' }).fill('{"test":"testitest"}');
        await page.getByRole('button', { name: 'Save' }).click();

        await saveDraftGraph(page);
        await page.locator('tds-icon[name="back"]').click();
        await deleteGraph(page, graphName);

    });

    
    test('Add context using imported file', async ({ page }) => {
        const graphName = 'AUTOTEST Context Import';
        await createGraph(page, graphName);
        // Add JsonLdContext component to graph
        await addComponentTograph(page, 'Script Action', 400, -100);
        await page.locator('.react-flow__node').getByText('Script Action').click();
        await page.getByRole('button', { name: 'Enter Setup' }).click();
        await page.getByText('Optional (1)').click();
        await addComponentTograph(page, 'JsonLdContext', 500, 100);
        await page.locator('.react-flow__node').getByText('JsonLdContext').last().click();
        await page.waitForTimeout(500);

        // Feed file name to file input
        await page.locator('#file-upload').setInputFiles(path.join(__dirname, 'testdata/test.ttl'));
        await page.getByRole('button', { name: 'Save' }).click();

        await saveDraftGraph(page);
        await page.locator('tds-icon[name="back"]').click();
        await deleteGraph(page, graphName);
        
    });

    test.skip('Replace context using new imported file', async ({ page }) => {
        const graphName = 'AUTOTEST Context Replace';
        
    });
});