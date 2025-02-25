import { test, expect } from '@playwright/test';
import { 
    loginUser, 
    openGraph,
    createGraph,
    saveDraftGraph, 
    saveGraphToStardog,
    deleteGraph
} from './common';


test.describe('Execute orchestration graphs', () => {

    test.beforeEach('Log in test user', async ({ page }) => {
        await loginUser(page);
    });

    test('Execute orchestration graph synchronously', async ({ page }) => {
        const graphName = 'pizza-test';
        const paramName = 'AutoParamName'

        // Used until we get a specific copy for using in automation suite
        await page.getByText('Other Flows').click();
        
        await openGraph(page, graphName);
        await page.getByText('Execute', { exact: true }).click();
        await page.getByRole('textbox', { name: 'New name' }).fill(paramName);
        await page.getByRole('button', { name: 'Save' }).click();
        await page.getByLabel('Saved parameters').click();
        await page.getByRole('button', { name: 'Select parameter set icon' }).click();
        await page.getByRole('button', { name: paramName }).click();
        await page.getByRole('button', { name: 'Execute' }).click();

        await expect(page.getByLabel('Graph execution result')).toBeVisible();
        await expect(page.getByText('"@id":"http://kg.scania.com/it/Bussol..."')).toBeVisible();
        await page.getByLabel('Graph execution result').getByRole('img', { name: 'icon cross' }).click();
        await page.getByRole('button', { name: 'Delete' }).click();

    });
});