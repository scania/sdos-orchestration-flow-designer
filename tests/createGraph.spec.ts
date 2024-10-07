import { test, expect } from '@playwright/test';
import { 
    loginUser, 
    createGraph,
    saveDraftGraph, 
    saveGraphToStardog,
    deleteGraph
} from './common';



test.describe('Create orchestration graph', () => {

    test.beforeEach('Log in test user', async ({ page }) => {
        await loginUser(page);
    });
    
    test('Create and save draft graph', async ({ page }) => {
        const graphName = 'AUTOTEST Graph';
        await createGraph(page, graphName);
        await saveDraftGraph(page);
        await page.locator('tds-icon[name="back"]').click();

        const graphCard = page.getByRole('heading', { name: graphName.split(' ').join('-') }).locator('../..');
        await expect(graphCard.locator('dd', { hasText: 'Draft' })).toBeVisible()
        await deleteGraph(page, graphName);
    
    });


    test('Add Action component using drag n drop', async ({ page }) => {
        const graphName = 'AUTOTEST Graph Action';

        await createGraph(page, graphName);

        // Drag 'n' drop Action
        const taskNode = page.locator('.react-flow__node-input');
        const scriptAction = page.getByText('Script Action', { exact: true });
        
        await scriptAction.dragTo(
            taskNode,
            { targetPosition: { // Offset in pixels
                x: 400, 
                y: -100
            }, 
            force: true }
        );

        // Create connection
        await taskNode.locator('div[data-handlepos="right"]').click();
        await page.locator('.react-flow__node').getByText('Script Action')
        .locator('../..').locator('div[data-handlepos="left"]').click();

        await saveDraftGraph(page);
        await page.locator('tds-icon[name="back"]').click();
        await deleteGraph(page, graphName);

    });


    test('Add Parameter component using drag n drop', async ({ page }) => {
        const graphName = 'AUTOTEST Graph Parameter';

        await createGraph(page, graphName);
        await page.getByText('Parameters', { exact: true }).click();

        // Drag 'n' drop Parameter
        const taskNode = page.locator('.react-flow__node-input');
        const StandardParam = page.getByText('Standard Parameter', { exact: true });
        
        await StandardParam.dragTo(
            taskNode,
            { targetPosition: { // Offset in pixels
                x: 400, 
                y: 100
            }, 
            force: true }
        );

        // Create connection
        await taskNode.locator('div[data-handlepos="right"]').click();
        await page.locator('.react-flow__node').getByText('Standard Parameter')
        .locator('../..').locator('div[data-handlepos="left"]').click();

        await saveDraftGraph(page);
        await page.locator('tds-icon[name="back"]').click();
        await deleteGraph(page, graphName);
    });


    test('Save drafted graph to Stardog', async ({ page }) => {
        const graphName = 'AUTOTEST Draft Graph';

        // Setup draft graph
        await createGraph(page, graphName);
        await saveDraftGraph(page);
        await page.locator('tds-icon[name="back"]').click();
        const graphCard = page.getByRole('heading', { name: graphName.split(' ').join('-') }).locator('../..');
        await expect(graphCard.locator('dd', { hasText: 'Draft' })).toBeVisible();

        await graphCard.getByRole('button', { name: 'Open' }).click();
        
        // Drag 'n' drop Action
        const taskNode = page.locator('.react-flow__node-input');
        const scriptAction = page.getByText('Script Action', { exact: true });
        
        await scriptAction.dragTo(
            taskNode,
            { targetPosition: { // Offset in pixels
                x: 400, 
                y: -100
            }, 
            force: true }
        );

        // Create connection
        await taskNode.locator('div[data-handlepos="right"]').click();
        await page.locator('.react-flow__node').getByText('Script Action')
        .locator('../..').locator('div[data-handlepos="left"]').click();

        await saveGraphToStardog(page);
        await page.locator('tds-icon[name="back"]').click();
        await expect(graphCard.locator('dd', { hasText: 'Saved' })).toBeVisible();
        await deleteGraph(page, graphName);
        
    });

});