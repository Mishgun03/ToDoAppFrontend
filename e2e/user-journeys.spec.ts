import { test, expect, type Locator, type Page } from '@playwright/test';

const API_BASE = process.env.E2E_API_URL || 'http://localhost:8080/api/v1';
const PASSWORD = 'Test123!@';

type Priority = 'BLOCKER' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

interface TestUser {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface TodoSeed {
  title: string;
  content?: string;
  deadline?: string;
  done?: boolean;
  priority?: Priority;
  repeatType?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
}

interface EditFields {
  title?: string;
  content?: string;
  priority?: Priority;
}

function uniqueValue(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function buildUser(): TestUser {
  const suffix = uniqueValue('pw-user');
  return {
    username: suffix,
    email: `${suffix}@test.com`,
    password: PASSWORD,
    firstName: 'Playwright',
    lastName: 'Journey',
  };
}

function priorityLabel(priority: Priority): string {
  switch (priority) {
    case 'BLOCKER':
      return 'Blocker';
    case 'HIGH':
      return 'High';
    case 'MEDIUM':
      return 'Medium';
    case 'LOW':
      return 'Low';
    case 'NONE':
      return 'Нет';
  }
}

function todoCard(page: Page, title: string): Locator {
  return page
    .locator('div.group.rounded-lg.border')
    .filter({ has: page.getByRole('link', { name: title, exact: true }) })
    .first();
}

async function toggleTodoCard(page: Page, title: string): Promise<void> {
  await todoCard(page, title).locator('[role="checkbox"]').first().click();
}

async function registerViaUI(page: Page, user: TestUser): Promise<void> {
  await page.goto('/register');
  await page.locator('#username').fill(user.username);
  await page.locator('#email').fill(user.email);
  await page.locator('#password').fill(user.password);
  await page.locator('#firstName').fill(user.firstName);
  await page.locator('#lastName').fill(user.lastName);
  await page.getByRole('button', { name: 'Зарегистрироваться' }).click();
  await page.waitForURL('**/login', { timeout: 15000 });
}

async function loginViaUI(page: Page, user: TestUser, password = user.password): Promise<void> {
  await page.goto('/login');
  await page.locator('#username').fill(user.username);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: 'Войти' }).click();
}

async function registerAndLogin(page: Page): Promise<TestUser> {
  const user = buildUser();
  await registerViaUI(page, user);
  await loginViaUI(page, user);
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await expect(page.getByRole('heading', { name: 'Все задачи' })).toBeVisible();
  return user;
}

async function createTodoViaUI(
  page: Page,
  todo: { title: string; content?: string },
): Promise<void> {
  await page.getByRole('button', { name: /Новая задача/i }).click();

  const dialog = page.getByRole('dialog', { name: 'Новая задача' });
  await expect(dialog).toBeVisible();

  await dialog.locator('#create-title').fill(todo.title);
  if (todo.content !== undefined) {
    await dialog.locator('#create-content').fill(todo.content);
  }

  await dialog.getByRole('button', { name: 'Создать' }).click();
  await expect(dialog).not.toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('link', { name: todo.title, exact: true })).toBeVisible({
    timeout: 10000,
  });
}

async function openTodoCardMenu(page: Page, title: string): Promise<void> {
  const card = todoCard(page, title);
  await expect(card).toBeVisible();
  await card.hover();
  await card.getByRole('button', { name: 'Действия' }).click();
}

async function openTodoDetail(page: Page, title: string): Promise<void> {
  await page.getByRole('link', { name: title, exact: true }).click();
  await page.waitForURL(/\/todos\/.+/, { timeout: 10000 });
  await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
}

async function chooseSelectOption(
  page: Page,
  dialog: Locator,
  index: number,
  label: string,
): Promise<void> {
  await dialog.getByRole('combobox').nth(index).click();
  await page.getByRole('option', { name: label, exact: true }).click();
}

async function submitEditDialog(page: Page, fields: EditFields): Promise<void> {
  const dialog = page.getByRole('dialog', { name: 'Редактировать задачу' });
  await expect(dialog).toBeVisible();

  if (fields.title !== undefined) {
    await dialog.locator('#edit-title').fill(fields.title);
  }
  if (fields.content !== undefined) {
    await dialog.locator('#edit-content').fill(fields.content);
  }
  if (fields.priority !== undefined) {
    await chooseSelectOption(page, dialog, 0, priorityLabel(fields.priority));
  }

  await dialog.getByRole('button', { name: 'Сохранить' }).click();
  await expect(dialog).not.toBeVisible({ timeout: 10000 });
}

async function editTodoFromCard(
  page: Page,
  originalTitle: string,
  fields: EditFields,
): Promise<void> {
  await openTodoCardMenu(page, originalTitle);
  await page.getByRole('menuitem', { name: 'Изменить' }).click();
  await submitEditDialog(page, fields);
}

async function editTodoFromDetail(page: Page, fields: EditFields): Promise<void> {
  await page.getByRole('button', { name: /Изменить/i }).click();
  await submitEditDialog(page, fields);
}

async function deleteTodoFromCard(page: Page, title: string): Promise<void> {
  await openTodoCardMenu(page, title);
  await page.getByRole('menuitem', { name: 'Удалить' }).click();

  const dialog = page.getByRole('alertdialog', { name: 'Удалить задачу?' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Удалить' }).click();
  await expect(dialog).not.toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('link', { name: title, exact: true })).not.toBeVisible({
    timeout: 10000,
  });
}

async function searchTodos(page: Page, query: string): Promise<void> {
  await page.getByPlaceholder('Поиск задач...').fill(query);
}

async function logout(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Выйти' }).click();
  await page.waitForURL('**/login', { timeout: 10000 });
}

async function getToken(page: Page): Promise<string> {
  const token = await page.evaluate(() => localStorage.getItem('todoapi_token'));
  expect(token).toBeTruthy();
  return token as string;
}

async function createTodoViaApi(page: Page, todo: TodoSeed) {
  const token = await getToken(page);
  const response = await page.request.post(`${API_BASE}/todos`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: todo,
  });

  expect(response.ok()).toBeTruthy();
  return response.json();
}

test.describe('Deep End-to-End Journeys', () => {
  test('J1: login, replace a deleted note, edit it, complete it, filter it, and find it again', async ({
    page,
  }) => {
    await registerAndLogin(page);

    const firstTitle = uniqueValue('черновик');
    const secondTitle = uniqueValue('проект-феникс');
    const updatedTitle = `${secondTitle}-итог`;

    await createTodoViaUI(page, {
      title: firstTitle,
      content: 'Временная заметка для удаления',
    });
    await deleteTodoFromCard(page, firstTitle);
    await expect(page.getByText('Задач пока нет')).toBeVisible();

    await createTodoViaUI(page, {
      title: secondTitle,
      content: 'Новая версия заметки после удаления первой',
    });
    await editTodoFromCard(page, secondTitle, {
      title: updatedTitle,
      content: 'Отредактированная заметка, которую нужно найти снова',
    });

    await toggleTodoCard(page, updatedTitle);

    await page.getByRole('button', { name: 'Завершённые' }).click();
    await expect(page.getByRole('link', { name: updatedTitle, exact: true })).toBeVisible();

    await searchTodos(page, 'итог');
    await expect(page.getByRole('link', { name: updatedTitle, exact: true })).toBeVisible();

    await openTodoDetail(page, updatedTitle);
    await expect(page.getByText('Отредактированная заметка, которую нужно найти снова')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Отметить незавершённой' })).toBeVisible();
  });

  test('J2: validate registration, recover from failed login, revisit profile, and continue working', async ({
    page,
  }) => {
    const user = buildUser();
    const noteTitle = uniqueValue('повторный-вход');

    await page.goto('/register');
    await page.locator('#username').fill(user.username);
    await page.locator('#email').fill('broken-email');
    await page.locator('#password').fill('short');
    await page.locator('#firstName').fill(user.firstName);
    await page.locator('#lastName').fill(user.lastName);
    await page.getByRole('button', { name: 'Зарегистрироваться' }).click();

    await expect(page).toHaveURL(/\/register/);
    await expect(page.locator('#email')).toHaveValue('broken-email');
    await expect(page.locator('#password')).toHaveValue('short');

    await page.locator('#email').fill(user.email);
    await page.locator('#password').fill(user.password);
    await page.getByRole('button', { name: 'Зарегистрироваться' }).click();
    await page.waitForURL('**/login', { timeout: 15000 });

    await loginViaUI(page, user, 'WrongPass1!');
    await expect(page.getByText('Неверное имя пользователя или пароль')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);

    await loginViaUI(page, user);
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    await page.goto('/profile');
    await expect(page.getByRole('heading', { name: 'Профиль' })).toBeVisible();
    await expect(page.getByRole('main').getByText(user.username, { exact: true })).toBeVisible();

    await logout(page);
    await page.goto('/dashboard');
    await page.waitForURL('**/login', { timeout: 10000 });

    await loginViaUI(page, user);
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await createTodoViaUI(page, {
      title: noteTitle,
      content: 'Заметка после повторного входа в систему',
    });
    await searchTodos(page, 'повторный');
    await openTodoDetail(page, noteTitle);
  });

  test('J3: create several notes, rename the searched note, lose the old query, and recover it with a new query', async ({
    page,
  }) => {
    await registerAndLogin(page);

    const alphaTitle = uniqueValue('alpha-документ');
    const betaTitle = uniqueValue('beta-доска');
    const gammaTitle = uniqueValue('gamma-план');
    const renamedTitle = uniqueValue('delta-документ');

    await createTodoViaUI(page, { title: alphaTitle, content: 'Изначально ищется по alpha' });
    await createTodoViaUI(page, { title: betaTitle, content: 'Соседняя заметка' });
    await createTodoViaUI(page, { title: gammaTitle, content: 'Третья заметка' });

    await searchTodos(page, 'alpha');
    await expect(page.getByRole('link', { name: alphaTitle, exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: betaTitle, exact: true })).not.toBeVisible();

    await openTodoDetail(page, alphaTitle);
    await editTodoFromDetail(page, {
      title: renamedTitle,
      content: 'После переименования заметка должна находиться только по новому имени',
    });

    await page.goto('/dashboard');

    await searchTodos(page, 'alpha');
    await expect(page.getByText(/Ничего не найдено по запросу/i)).toBeVisible();

    await searchTodos(page, 'delta');
    await expect(page.getByRole('link', { name: renamedTitle, exact: true })).toBeVisible();

    await searchTodos(page, '');
    await deleteTodoFromCard(page, gammaTitle);
    await searchTodos(page, 'beta');
    await openTodoDetail(page, betaTitle);
  });

  test('J4: move a note between priority views, then find it in the new priority list', async ({
    page,
  }) => {
    await registerAndLogin(page);

    const highTitle = uniqueValue('авария-сервера');
    const lowTitle = uniqueValue('полив-цветов');
    const movedTitle = `${highTitle}-после-правки`;

    await createTodoViaApi(page, { title: highTitle, priority: 'HIGH', content: 'Высокий приоритет' });
    await createTodoViaApi(page, { title: lowTitle, priority: 'LOW', content: 'Низкий приоритет' });

    await page.goto('/dashboard?priority=HIGH');
    await expect(page.getByRole('heading', { name: 'Задачи: HIGH' })).toBeVisible();
    await expect(page.getByRole('link', { name: highTitle, exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: lowTitle, exact: true })).not.toBeVisible();

    await openTodoDetail(page, highTitle);
    await editTodoFromDetail(page, {
      title: movedTitle,
      content: 'Перенесена в низкий приоритет и обновлена',
      priority: 'LOW',
    });

    await page.goto('/dashboard?priority=HIGH');
    await expect(page).toHaveURL(/priority=HIGH/);
    await expect(page.getByRole('link', { name: movedTitle, exact: true })).not.toBeVisible();

    await page.getByRole('link', { name: 'Low' }).click();
    await expect(page).toHaveURL(/priority=LOW/);
    await expect(page.getByRole('link', { name: lowTitle, exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: movedTitle, exact: true })).toBeVisible();

    await searchTodos(page, 'после-правки');
    await openTodoDetail(page, movedTitle);
    await expect(page.getByText('Перенесена в низкий приоритет и обновлена')).toBeVisible();
  });

  test('J5: move a note between active and completed states, delete another one, and keep working with the survivor', async ({
    page,
  }) => {
    await registerAndLogin(page);

    const reportTitle = uniqueValue('квартальный-отчет');
    const syncTitle = uniqueValue('командный-созвон');

    await createTodoViaUI(page, { title: reportTitle, content: 'Нужно завершить и вернуть в работу' });
    await createTodoViaUI(page, { title: syncTitle, content: 'Эта заметка будет удалена' });

    await toggleTodoCard(page, reportTitle);
    await page.getByRole('button', { name: 'Завершённые' }).click();
    await expect(page.getByRole('link', { name: reportTitle, exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: syncTitle, exact: true })).not.toBeVisible();

    await openTodoDetail(page, reportTitle);
    await page.getByRole('button', { name: 'Отметить незавершённой' }).click();
    await expect(page.getByRole('button', { name: 'Отметить завершённой' })).toBeVisible();

    await page.goto('/dashboard');

    await page.getByRole('button', { name: 'Активные' }).click();
    await expect(page.getByRole('link', { name: reportTitle, exact: true })).toBeVisible();

    await deleteTodoFromCard(page, syncTitle);
    await searchTodos(page, 'квартальный');
    await openTodoDetail(page, reportTitle);
  });

  test('J6: review the smart list, finish the urgent note, and verify it still exists outside the smart view', async ({
    page,
  }) => {
    await registerAndLogin(page);

    const urgentTitle = uniqueValue('срочно-сегодня');
    const futureTitle = uniqueValue('на-следующей-неделе');
    const noDeadlineTitle = uniqueValue('без-дедлайна');
    const updatedTitle = `${urgentTitle}-закрыто`;

    await createTodoViaApi(page, {
      title: urgentTitle,
      content: 'Эта заметка должна попасть в умный список',
      deadline: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      priority: 'HIGH',
    });
    await createTodoViaApi(page, {
      title: futureTitle,
      content: 'Будущая заметка не должна попасть в умный список',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'LOW',
    });
    await createTodoViaApi(page, {
      title: noDeadlineTitle,
      content: 'Заметка без дедлайна',
    });

    await page.getByRole('link', { name: 'Умный список' }).click();
    await expect(page.getByRole('heading', { name: 'Умный список' })).toBeVisible();
    await expect(page.getByRole('link', { name: urgentTitle, exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: futureTitle, exact: true })).not.toBeVisible();
    await expect(page.getByRole('link', { name: noDeadlineTitle, exact: true })).not.toBeVisible();

    await openTodoDetail(page, urgentTitle);
    await editTodoFromDetail(page, {
      title: updatedTitle,
      content: 'Срочная заметка закрыта после обработки',
    });
    await page.getByRole('button', { name: 'Отметить завершённой' }).click();
    await expect(page.getByRole('button', { name: 'Отметить незавершённой' })).toBeVisible();

    await page.goto('/dashboard?view=smart');
    await expect(page.getByText('Всё сделано!')).toBeVisible();

    await page.goto('/dashboard');
    await searchTodos(page, 'закрыто');
    await openTodoDetail(page, updatedTitle);
    await expect(page.getByText('Срочная заметка закрыта после обработки')).toBeVisible();
  });

  test('J7: keep dashboard and detail metadata consistent while changing the note priority', async ({
    page,
  }) => {
    await registerAndLogin(page);

    const originalTitle = uniqueValue('релиз-клиента');
    const updatedTitle = `${originalTitle}-обновлено`;
    const deadline = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();

    await createTodoViaApi(page, {
      title: originalTitle,
      content: 'Проверка согласованности карточки и детальной страницы',
      deadline,
      priority: 'MEDIUM',
      repeatType: 'DAILY',
    });

    await page.goto('/dashboard');
    await expect(page.getByRole('link', { name: originalTitle, exact: true })).toBeVisible();
    await expect(todoCard(page, originalTitle).getByText('Medium')).toBeVisible();
    await expect(todoCard(page, originalTitle).getByText('Daily')).toBeVisible();

    await openTodoDetail(page, originalTitle);
    await expect(page.getByText('Проверка согласованности карточки и детальной страницы')).toBeVisible();
    await expect(page.getByText('Medium', { exact: true })).toBeVisible();
    await expect(page.getByText('Daily')).toBeVisible();

    await editTodoFromDetail(page, {
      title: updatedTitle,
      content: 'После изменения карточка и детали должны совпадать',
      priority: 'HIGH',
    });

    await page.goto('/dashboard');
    await expect(page.getByRole('link', { name: updatedTitle, exact: true })).toBeVisible();

    await page.goto('/dashboard?priority=HIGH');
    await expect(page.getByRole('link', { name: updatedTitle, exact: true })).toBeVisible();

    await openTodoDetail(page, updatedTitle);
    await expect(page.getByText('После изменения карточка и детали должны совпадать')).toBeVisible();
    await expect(page.getByText('High', { exact: true })).toBeVisible();
  });

  test('J8: work through a paginated list, update a note from page two, find it, and remove it', async ({
    page,
  }) => {
    await registerAndLogin(page);

    const targetTitle = uniqueValue('страница-два-цель');
    const updatedTitle = `${targetTitle}-обновлено`;

    await createTodoViaUI(page, {
      title: targetTitle,
      content: 'Эта заметка должна оказаться на второй странице',
    });

    for (let index = 0; index < 10; index += 1) {
      await createTodoViaApi(page, {
        title: uniqueValue(`заполнитель-${index}`),
        content: 'Заполнитель для проверки пагинации',
      });
    }

    await page.goto('/dashboard');
    await expect(page.getByText('1 / 2')).toBeVisible();
    await page.getByRole('button', { name: 'Вперёд' }).click();
    await expect(page.getByText('2 / 2')).toBeVisible();
    await expect(page.getByRole('link', { name: targetTitle, exact: true })).toBeVisible();

    await openTodoDetail(page, targetTitle);
    await editTodoFromDetail(page, {
      title: updatedTitle,
      content: 'Обновлена на второй странице и должна находиться после поиска',
    });

    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'Вперёд' }).click();
    await expect(page.getByText('2 / 2')).toBeVisible();
    await expect(page.getByRole('link', { name: updatedTitle, exact: true })).toBeVisible();

    await searchTodos(page, 'обновлено');
    await openTodoDetail(page, updatedTitle);
    await page.getByRole('button', { name: /Удалить/i }).click();

    const dialog = page.getByRole('alertdialog', { name: 'Удалить задачу?' });
    await dialog.getByRole('button', { name: 'Удалить' }).click();
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    await searchTodos(page, 'обновлено');
    await expect(page.getByText(/Ничего не найдено по запросу/i)).toBeVisible();
  });

  test('J9: reject a duplicate account, recover from a bad password, and continue a note workflow', async ({
    page,
  }) => {
    const user = buildUser();
    const firstTitle = uniqueValue('дубликат-черновик');
    const secondTitle = uniqueValue('дубликат-основа');

    await registerViaUI(page, user);

    await page.goto('/register');
    await page.locator('#username').fill(user.username);
    await page.locator('#email').fill(user.email);
    await page.locator('#password').fill(user.password);
    await page.locator('#firstName').fill(user.firstName);
    await page.locator('#lastName').fill(user.lastName);
    await page.getByRole('button', { name: 'Зарегистрироваться' }).click();
    await expect(page).toHaveURL(/\/register/);
    await expect(page.locator('#username')).toHaveValue(user.username);

    await loginViaUI(page, user, 'WrongPass1!');
    await expect(page.getByText('Неверное имя пользователя или пароль')).toBeVisible();

    await loginViaUI(page, user);
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    await createTodoViaUI(page, { title: firstTitle, content: 'Будет удалена' });
    await createTodoViaUI(page, { title: secondTitle, content: 'Должна остаться после восстановления' });
    await deleteTodoFromCard(page, firstTitle);

    await searchTodos(page, 'основа');
    await openTodoDetail(page, secondTitle);
    await expect(page.getByText('Должна остаться после восстановления')).toBeVisible();
  });

  test('J10: upload files to a note, add another file later, verify them in detail and profile, then delete the note', async ({
    page,
  }) => {
    await registerAndLogin(page);

    const todoTitle = uniqueValue('файлы-для-заявки');
    const updatedTitle = `${todoTitle}-проверено`;

    await page.getByRole('button', { name: /Новая задача/i }).click();

    const createDialog = page.getByRole('dialog', { name: 'Новая задача' });
    await expect(createDialog).toBeVisible();
    await createDialog.locator('#create-title').fill(todoTitle);
    await createDialog.locator('#create-content').fill('Заметка с файлами для проверки загрузки');
    await createDialog.locator('input[type="file"]').setInputFiles([
      {
        name: 'brief.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('brief file for upload scenario'),
      },
      {
        name: 'evidence.json',
        mimeType: 'application/json',
        buffer: Buffer.from('{"ok":true}'),
      },
    ]);

    await createDialog.getByRole('button', { name: 'Создать' }).click();
    await expect(createDialog).not.toBeVisible({ timeout: 10000 });

    await expect(page.getByRole('link', { name: todoTitle, exact: true })).toBeVisible({
      timeout: 10000,
    });

    await openTodoDetail(page, todoTitle);
    await expect(page.getByRole('heading', { name: todoTitle, exact: true })).toBeVisible();
    await expect(page.getByText('Файлы (2)')).toBeVisible();
    await expect(page.getByText('brief.txt')).toBeVisible();
    await expect(page.getByText('evidence.json')).toBeVisible();

    await page.getByRole('button', { name: /Изменить/i }).click();
    const editDialog = page.getByRole('dialog', { name: 'Редактировать задачу' });
    await expect(editDialog).toBeVisible();
    await editDialog.locator('#edit-title').fill(updatedTitle);
    await editDialog.locator('#edit-content').fill('После редактирования к заметке добавлен третий файл');
    await editDialog.locator('input[type="file"]').setInputFiles({
      name: 'notes.md',
      mimeType: 'text/markdown',
      buffer: Buffer.from('# uploaded later'),
    });

    await editDialog.getByRole('button', { name: 'Сохранить' }).click();
    await expect(editDialog).not.toBeVisible({ timeout: 10000 });

    await expect(page.getByRole('heading', { name: updatedTitle, exact: true })).toBeVisible();
    await expect(page.getByText('Файлы (3)')).toBeVisible();
    await expect(page.getByText('notes.md')).toBeVisible();

    await page.goto('/profile');
    await expect(page.getByRole('heading', { name: 'Профиль' })).toBeVisible();
    await expect(page.getByText(/Использовано|Хранилище|Место/i)).toBeVisible();

    await page.goto('/dashboard');
    await searchTodos(page, 'проверено');
    await expect(page.getByRole('link', { name: updatedTitle, exact: true })).toBeVisible();
    await deleteTodoFromCard(page, updatedTitle);
  });
});
