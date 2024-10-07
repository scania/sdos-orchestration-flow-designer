import { Page, expect } from "@playwright/test";
import fs from 'fs';
const userInfo = JSON.parse(fs.readFileSync('./tests/user.json', 'utf-8'));

export async function loginUser( 
    page: Page, 
    username: string = userInfo.OFD_USERNAME,
    password: string = userInfo.OFD_PASSWORD
): Promise<void> {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'WELCOME TO OUR ORCHESTRATION' })).toBeVisible();
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.fill('input[type="email"]', username);
    await page.getByRole('button', { name: 'Next' }).click();
    await page.fill('input[type="password"]', password);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByRole('heading', { name: 'My Work' })).toBeVisible();
};


export async function saveDraftGraph( 
    page: Page 
): Promise<void> {
    // Save graph
    await page.getByText('Save Draft', { exact: true }).click();
    await expect(page.locator('tds-toast[header="Success"]')).toBeVisible();
    await expect(page.locator('tds-toast[header="Success"]'))
    .toContainText('Graph has been successfully saved');
};


export async function createGraph( 
    page: Page, 
    graphName: string, 
    graphDesc: string = "AUTOTEST Description" 
): Promise<void> {
    // Create graph
    await page.getByRole('button', { name: 'Create new graph icon plus'} ).click();
    await page.getByRole('textbox', { name: 'Name' }).fill(graphName);
    await page.getByRole('textbox', { name: 'Description' }).fill(graphDesc);
    await page.getByRole('button', { name: 'Create', exact: true }).click();
    await expect(page.getByRole('heading', { name: graphName.split(' ').join('-') })).toBeVisible();

};


export async function saveGraphToStardog( 
    page: Page 
): Promise<void> {
    // Save graph
    await page.getByText('Save', { exact: true }).click();
    await expect(page.locator('tds-toast[header="Success"]')).toBeVisible();
    await expect(page.locator('tds-toast[header="Success"]'))
    .toContainText('Graph has been successfully saved');
};


export async function deleteGraph(
    page: Page,
    graphName: string
): Promise<void> {
    const graphCard = page.getByRole('heading', { name: graphName.split(' ').join('-') }).locator('../..');
    await graphCard.locator('tds-icon[name="meatballs"]').click();
    await page.locator('#react-tiny-popover-container').getByText('Delete').click();
    await expect(graphCard).toHaveCount(0);
};
