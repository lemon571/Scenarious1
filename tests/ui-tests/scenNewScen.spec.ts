import { test, expect } from '@playwright/test';

//template
test('Create script with template', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('button', { name: 'Новый сценарий' }).click();
  await page.getByRole('button', { name: 'По шаблону Быстро подготовтесь ко дню рождения, лекторию или свадьбе' }).click();
  await page.locator('input[name="g-:r29:"]').check();
  await page.getByRole('button', { name: 'Перейти к участникам' }).click();
  await page.getByRole('button', { name: 'Создать сценарий' }).click();
});

// 0
test('Create script', async ({ page }) => {
    await page.goto('http://localhost:5173/scenario/create');
    await page.click('text=С нуля');

    // Определяем значения для полей ввода
    const formData = {
        'Название': '1',
        'Время начала': '1111',
        'Сколько идет': '2222',
       // 'Подробнее о мероприятии': 'Cценарий 1',
    };

    // Заполняем каждое поле ввода
    for (const [placeholder, value] of Object.entries(formData)) {
        const inputSelector = `input[placeholder="${placeholder}"]`;
        
        // Находим поле ввода и заполняем его
        await expect(page.locator(inputSelector)).toBeVisible(); // Проверяем, что поле ввода видно
        await page.fill(inputSelector, value); // Заполняем поле ввода
    }

    // Заполнение календаря
   // const calendarSelector = 'div.g-date-date-picker__popup-anchor';
    //await expect(page.locator(calendarSelector)).toBeVisible(); // Проверяем, что календарь видим
    //await page.click(calendarSelector); // Нажимаем на календарь

    // Здесь вы можете добавить логику для выбора конкретной даты "Friday, August 22"
    // Например, если дата появляется в некотором элементе, вам может понадобиться кликнуть на неё.
    // await page.click('text=Friday, August 22'); // Или любой подходящий селектор

    // Проверяем заполненные поля
    const checkSelectors = {
        'Название': '1',
        'Время начала': '1111',
        'Сколько идет': '2222',
        'Подробнее о мероприятии': 'Cценарий 1',
        'Calendar': 'Friday, August 22', // Для календаря вы можете добавить дополнительные проверки
    };

    // Можно добавить дополнительные проверки здесь, например, проверить заполненные значения
    for (const [placeholder, expectedValue] of Object.entries(checkSelectors)) {
        const inputSelector = `input[placeholder="${placeholder}"]`;
        const inputValue = await page.locator(inputSelector).inputValue(); // Получаем значение поля

        // Проверяем, что значение совпадает с заполненным
        //await expect(inputValue).toBe(expectedValue);
    }

    // Дополнительная проверка для календаря
    // const selectedDate = await page.locator(calendarSelector).innerText();
    // await expect(selectedDate).toContain('Friday, August 22'); // Проверка на выбранную дату, если это применимо

  await page.goto('http://localhost:5173/');
  await page.getByRole('button', { name: 'Новый сценарий' }).click();
  await page.getByRole('button', { name: 'С нуля Уникальный сценарий для нестандартных или объемных мероприятий' }).click();
  await page.getByRole('textbox', { name: 'Название' }).click();
  await page.getByRole('textbox', { name: 'Название' }).dblclick();
  await page.getByRole('textbox', { name: 'Название' }).fill('1');
  await page.getByRole('button', { name: 'Calendar' }).click();
  await page.getByRole('button', { name: 'Monday, August 11,' }).click();
  await page.getByRole('textbox', { name: 'Время начала' }).click();
  await page.getByRole('textbox', { name: 'Сколько идет' }).click();
  await page.getByRole('textbox', { name: 'Подробнее о мероприятии' }).click();
  await page.getByRole('textbox', { name: 'Подробнее о мероприятии' }).dblclick();
  await page.getByRole('textbox', { name: 'Подробнее о мероприятии' }).fill('1');
  await page.getByRole('button', { name: 'Перейти к участникам' }).click();
  await page.getByRole('button', { name: 'Создать сценарий' }).click();
});
