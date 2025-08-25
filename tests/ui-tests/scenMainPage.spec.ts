import { test, expect } from '@playwright/test';
//import * as allure from "allure-js-commons";

test('Check subheader on homepage', async ({ page }) => {
  await page.goto('http://localhost:5173');

  const subheader = page.locator('div._subheader_1bh2o_8');
 
  await expect(subheader).toBeVisible();         
  await expect(subheader).not.toBeEmpty();       
  await expect(subheader).toHaveClass(/_subheader_/); 
});

test('Check presence of All Scenarios block', async ({ page }) => {
  await page.goto('http://localhost:5173');

  const scenariosBlock = page.locator('span.g-text.g-text_variant_display-1');

  await expect(scenariosBlock).toBeVisible();            
  await expect(scenariosBlock).not.toBeEmpty();         
  await expect(scenariosBlock).toHaveText('Все сценарии'); 
});


/*
test('firt test'), async ({page}) => {
    await page.goto('http://localhost:5173')

    await expect(page).toHaveURL('http://localhost:5173')
}*/

