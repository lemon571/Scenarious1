import { test, expect } from '@playwright/test';
//import * as allure from "allure-js-commons";

let page;

const urls = [
    'http://localhost:5173',
    'http://localhost:5173/scenario/create',
    'http://localhost:5173/templates',
    'http://localhost:5173/teams',
    'http://localhost:5173/settings',
    'http://localhost:5173/scenario/scn-1',
];

/*test.beforeAll(async ({ page }) => {
    await page.goto('http://localhost:5173');
});*/

test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext(); 
    page = await context.newPage(); 
});

test.afterEach(async () => {
    await page.close(); 
});



test('Check presence of container and blocks', async ({ page }) => {
    await page.goto('http://localhost:5173');

    const container = page.locator('div#root');
    
    await expect(container).toBeVisible(); 

    const blockSwg= container.locator('svg'); 
    const blockA= container.locator('a'); 
    const blockB = container.locator('button'); 

    const totalBlocksCount = await blockSwg.count() + await blockA.count() + await blockB.count();
    expect(totalBlocksCount).toBe(75);

    await Promise.all([...Array(await blockSwg.count()).keys()].map(async (i) => {
        await expect(blockSwg.nth(i)).toBeVisible(); 
    }));
    await Promise.all([...Array(await blockA.count()).keys()].map(async (i) => {
        await expect(blockA.nth(i)).toBeVisible(); 
    }));
    await Promise.all([...Array(await blockB.count()).keys()].map(async (i) => {
        await expect(blockB.nth(i)).toBeVisible(); 
    }));
});

/*
test('Check presence of buttons on multiple pages', async ({ page }) => {
    for (const url of urls) {
        await page.goto(url); // Переход на каждую страницу
        const container = page.locator('div._container_1tbqn_1'); 
        const buttons = container.locator('.g-button.g-button_view_action.g-button_size_m.g-button_pin_round-round._button_1tbqn_14'); 
        await expect(buttons).toBeVisible();
         const buttonCount = await buttons.count();
         expect(buttonCount).toBeGreaterThan(0);
    }
});
*/

test('Check button click action on the main page', async ({ page }) => {
    await page.goto('http://localhost:5173');
    const container = page.locator('div._container_1tbqn_1'); 
    const buttons = container.locator('.g-button.g-button_view_action.g-button_size_m.g-button_pin_round-round._button_1tbqn_14'); // Находим кнопки

    const buttonCount = await buttons.count();
    for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);
        await expect(button).toBeVisible(); 
        const initialUrl = page.url();
        await button.click(); 
        const newUrl = page.url();
        expect(newUrl).not.toEqual(initialUrl); 
        await page.goBack(); 
    }
});