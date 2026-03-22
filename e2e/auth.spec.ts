import { test, expect } from '@playwright/test';


const timestamp = () => Date.now().toString(36);

test.describe('Auth Flow', () => {

  //
  // Smoke Test 1: Landing page loads and has key elements
  //
  test('S1: Landing page renders correctly', async ({ page }) => {
    await page.goto('/');

    // Brand in header only (footer contains "TodoAPI ©" — substring match would be ambiguous)
    await expect(page.getByText('TodoAPI', { exact: true })).toBeVisible();

    // Should see CTA buttons
    await expect(page.getByRole('link', { name: /Начать бесплатно/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Войти в аккаунт/i })).toBeVisible();
  });

  //
  // Smoke Test 2: Register a new user
  //
  test('S2: Register new user -> redirects to login', async ({ page }) => {
    const ts = timestamp();

    await page.goto('/register');

    // Fill in registration form
    await page.locator('#username').fill(`pw_test_${ts}`);
    await page.locator('#email').fill(`pw_${ts}@test.com`);
    await page.locator('#password').fill('Test123!@');
    await page.locator('#firstName').fill('Playwright');
    await page.locator('#lastName').fill('Tester');

    // Submit
    await page.getByRole('button', { name: /Зарегистрироваться/i }).click();

    // Should redirect to login page
    await page.waitForURL('**/login', { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });

  // 
  // Smoke Test 3: Login -> lands on dashboard
  // 
  test('S3: Login existing user -> dashboard loads', async ({ page }) => {
    const ts = timestamp();
    const username = `pw_login_${ts}`;

    // Register first via API (faster than UI)
    const apiBase = process.env.E2E_API_URL || 'http://localhost:8080/api/v1';
    await page.request.post(`${apiBase}/auth/register`, {
      data: {
        username,
        password: 'Test123!@',
        email: `pw_login_${ts}@test.com`,
        firstName: 'Login',
        lastName: 'Test',
      },
    });

    // Now login via UI
    await page.goto('/login');
    await page.locator('#username').fill(username);
    await page.locator('#password').fill('Test123!@');
    await page.getByRole('button', { name: /Войти/i }).click();

    // Should redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await expect(page).toHaveURL(/\/dashboard/);

    // Page title in main (sidebar nav link has the same label)
    await expect(
      page.getByRole('heading', { name: 'Все задачи' })
    ).toBeVisible();
  });

  //
  // Smoke Test 4: Login with wrong password shows error
  //
  test('S4: Login with wrong password -> error message', async ({ page }) => {
    await page.goto('/login');

    await page.locator('#username').fill('nonexistent_user');
    await page.locator('#password').fill('WrongPass1!');
    await page.getByRole('button', { name: /Войти/i }).click();

    // Should see error
    await expect(
      page.getByText(/Неверное имя пользователя или пароль|ошибка/i)
    ).toBeVisible({ timeout: 5000 });

    // Should stay on login page
    await expect(page).toHaveURL(/\/login/);
  });
});
