import { test, expect, type Page } from '@playwright/test';


const timestamp = () => Date.now().toString(36);

async function registerAndLogin(page: Page): Promise<void> {
  const ts = timestamp();
  const username = `pw_todo_${ts}`;
  const apiBase = process.env.E2E_API_URL || 'http://localhost:8080/api/v1';

  // Register via API
  await page.request.post(`${apiBase}/auth/register`, {
    data: {
      username,
      password: 'Test123!@',
      email: `pw_todo_${ts}@test.com`,
      firstName: 'Todo',
      lastName: 'Test',
    },
  });

  // Login via UI
  await page.goto('/login');
  await page.locator('#username').fill(username);
  await page.locator('#password').fill('Test123!@');
  await page.getByRole('button', { name: /Войти/i }).click();
  await page.waitForURL('**/dashboard', { timeout: 10000 });
}

// Card actions trigger is visible on hover only (group-hover).
async function openTodoCardMenu(page: Page, todoTitle: string): Promise<void> {
  const card = page.locator('div.group.rounded-lg.border').filter({
    has: page.getByRole('link', { name: todoTitle }),
  });
  await card.hover();
  await card.getByRole('button', { name: 'Действия' }).click();
}

test.describe('Todo CRUD', () => {

  //
  // Smoke Test 5: Create a new todo via dialog
  //
  test('S5: Create todo -> appears in list', async ({ page }) => {
    await registerAndLogin(page);

    // Click "Новая задача"
    await page.getByRole('button', { name: /Новая задача/i }).click();

    // Fill title
    await page.locator('#create-title').fill('Playwright todo');

    // Fill optional description
    await page.locator('#create-content').fill('Created by Playwright smoke test');

    // Submit
    await page.getByRole('button', { name: /Создать/i }).click();

    // Wait for dialog to close and todo to appear
    await expect(page.getByText('Playwright todo')).toBeVisible({ timeout: 5000 });
  });

  //
  // Smoke Test 6: Click todo -> navigate to detail page
  //
  test('S6: Click todo -> detail page shows content', async ({ page }) => {
    await registerAndLogin(page);

    // Create todo via API for speed
    const apiBase = process.env.E2E_API_URL || 'http://localhost:8080/api/v1';

    // Get token from localStorage (we just logged in)
    const token = await page.evaluate(() => localStorage.getItem('todoapi_token'));

    await page.request.post(`${apiBase}/todos`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: { title: 'Detail test', content: 'Some description', priority: 'MEDIUM' },
    });

    // Reload dashboard
    await page.goto('/dashboard');
    await expect(page.getByText('Detail test')).toBeVisible({ timeout: 5000 });

    // Click the todo link
    await page.getByText('Detail test').click();

    // Should be on detail page
    await page.waitForURL(/\/todos\/.+/, { timeout: 5000 });
    await expect(page.getByText('Some description')).toBeVisible();
    // Priority badge on detail page (sidebar has a "Medium" filter link)
    await expect(
      page.getByRole('main').getByText('Medium', { exact: true })
    ).toBeVisible();
  });

  //
  // Smoke Test 7: Search todos from dashboard
  //
  test('S7: Search filters todo list', async ({ page }) => {
    await registerAndLogin(page);

    const apiBase = process.env.E2E_API_URL || 'http://localhost:8080/api/v1';
    const token = await page.evaluate(() => localStorage.getItem('todoapi_token'));
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    // Create two todos
    await page.request.post(`${apiBase}/todos`, {
      headers, data: { title: 'Buy groceries' },
    });
    await page.request.post(`${apiBase}/todos`, {
      headers, data: { title: 'Read a book' },
    });

    await page.goto('/dashboard');
    await expect(page.getByText('Buy groceries')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Read a book')).toBeVisible();

    // Type in search
    await page.getByPlaceholder('Поиск задач...').fill('Buy');

    // Wait for debounce + search
    await expect(page.getByText('Buy groceries')).toBeVisible({ timeout: 3000 });
    await expect(page.getByText('Read a book')).not.toBeVisible();
  });

  //
  // Smoke Test 8: Empty state shown when no todos
  //
  test('S8: New user sees empty state', async ({ page }) => {
    await registerAndLogin(page);

    await expect(page.getByText('Задач пока нет')).toBeVisible({ timeout: 5000 });
  });

  //
  // Smoke Test 9: Edit todo from card menu -> list shows new title
  //
  test('S9: Edit via "Изменить" -> "Редактировать задачу" -> title updates', async ({
    page,
  }) => {
    await registerAndLogin(page);

    const apiBase = process.env.E2E_API_URL || 'http://localhost:8080/api/v1';
    const token = await page.evaluate(() => localStorage.getItem('todoapi_token'));

    await page.request.post(`${apiBase}/todos`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: { title: 'Edit me original', content: 'Body', priority: 'NONE' },
    });

    await page.goto('/dashboard');
    await expect(page.getByText('Edit me original')).toBeVisible({ timeout: 5000 });

    await openTodoCardMenu(page, 'Edit me original');
    await page.getByRole('menuitem', { name: 'Изменить' }).click();

    await expect(
      page.getByRole('dialog', { name: 'Редактировать задачу' })
    ).toBeVisible();
    await page.locator('#edit-title').fill('Edit me updated');
    await page.getByRole('button', { name: 'Сохранить' }).click();

    await expect(page.getByText('Edit me updated')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Edit me original')).not.toBeVisible();
  });

  //
  // Smoke Test 10: Delete todo -> confirm in alert dialog -> removed from list
  //
  test('S10: Delete with confirm -> todo disappears', async ({ page }) => {
    await registerAndLogin(page);

    const apiBase = process.env.E2E_API_URL || 'http://localhost:8080/api/v1';
    const token = await page.evaluate(() => localStorage.getItem('todoapi_token'));

    await page.request.post(`${apiBase}/todos`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: { title: 'Delete me e2e', content: 'x', priority: 'NONE' },
    });

    await page.goto('/dashboard');
    await expect(page.getByText('Delete me e2e')).toBeVisible({ timeout: 5000 });

    await openTodoCardMenu(page, 'Delete me e2e');
    await page.getByRole('menuitem', { name: 'Удалить' }).click();

    const confirm = page.getByRole('alertdialog', { name: 'Удалить задачу?' });
    await expect(confirm).toBeVisible();
    await confirm.getByRole('button', { name: 'Удалить' }).click();

    await expect(confirm).not.toBeVisible({ timeout: 5000 });
    await expect(
      page.getByRole('link', { name: 'Delete me e2e' })
    ).not.toBeVisible({ timeout: 5000 });
  });
});
