import { expect, test, type Page } from '@playwright/test';

type LoginMock =
  | {
      status: 200;
      body: {
        success: true;
        message: string;
        token: string;
        user: {
          userId: number;
          email: string;
          fullName: string;
          roleId: number;
          roleName: string;
          avatarUrl: string | null;
        };
        requiresPlatformSetup: boolean;
      };
    }
  | {
      status: 401;
      body: {
        message: string;
      };
    };

const loginPath = '/login';

async function mockLoginApi(page: Page, response: LoginMock) {
  await page.route('**/auth/login', async (route) => {
    await route.fulfill({
      status: response.status,
      contentType: 'application/json',
      body: JSON.stringify(response.body),
    });
  });
}

async function openLogin(page: Page) {
  await page.goto(loginPath);
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
}

async function submitLogin(page: Page, email: string, password: string) {
  await page.getByPlaceholder('you@example.com').fill(email);
  await page.getByPlaceholder('Enter your password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
}

function successResponse(
  roleName: string,
  pathSeed: number,
  requiresPlatformSetup = false,
): LoginMock {
  return {
    status: 200,
    body: {
      success: true,
      message: 'Login succesfully',
      token: `qtest-token-${pathSeed}`,
      user: {
        userId: pathSeed,
        email: `${roleName.replace(/\s+/g, '.')}@system.com`,
        fullName: `QTest ${roleName}`,
        roleId: pathSeed,
        roleName,
        avatarUrl: null,
      },
      requiresPlatformSetup,
    },
  };
}

test.describe('Login automation for qTest Launch', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
  });

  test('TC_LOGIN_001 should show validation when email and password are empty', async ({
    page,
  }) => {
    await openLogin(page);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByText('Please fill in all fields.')).toBeVisible();
  });

  test('TC_LOGIN_002 should show validation when email is empty', async ({
    page,
  }) => {
    await openLogin(page);
    await submitLogin(page, '', 'ValidPassword123');

    await expect(page.getByText('Please fill in all fields.')).toBeVisible();
  });

  test('TC_LOGIN_003 should show validation when password is empty', async ({
    page,
  }) => {
    await openLogin(page);
    await submitLogin(page, 'valid@email.com', '');

    await expect(page.getByText('Please fill in all fields.')).toBeVisible();
  });

  test('TC_LOGIN_004 should show backend error when credentials are invalid', async ({
    page,
  }) => {
    await mockLoginApi(page, {
      status: 401,
      body: { message: 'Email or password is not true' },
    });

    await openLogin(page);
    await submitLogin(page, 'wrong@email.com', 'WrongPass123');

    await expect(page.getByText('Email or password is not true')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('TC_LOGIN_005 should redirect admin to platform setup when required', async ({
    page,
  }) => {
    await mockLoginApi(page, successResponse('admin', 1, true));

    await openLogin(page);
    await submitLogin(page, 'admin@system.com', 'Admin@123');

    await expect(page).toHaveURL(/\/admin\/setup$/);
  });

  test('TC_LOGIN_006 should redirect admin to admin dashboard when setup is complete', async ({
    page,
  }) => {
    await mockLoginApi(page, successResponse('admin', 1, false));

    await openLogin(page);
    await submitLogin(page, 'admin@system.com', 'Admin@123');

    await expect(page).toHaveURL(/\/admin$/);
  });

  test('TC_LOGIN_007 should redirect academic manager after successful login', async ({
    page,
  }) => {
    await mockLoginApi(page, successResponse('academic manager', 2));

    await openLogin(page);
    await submitLogin(page, 'manager@system.com', 'Admin@123');

    await expect(page).toHaveURL(/\/academic$/);
  });

  test('TC_LOGIN_008 should redirect course provider after successful login', async ({
    page,
  }) => {
    await mockLoginApi(page, successResponse('course provider', 3));

    await openLogin(page);
    await submitLogin(page, 'provider@system.com', 'Admin@123');

    await expect(page).toHaveURL(/\/provider$/);
  });

  test('TC_LOGIN_009 should redirect learner after successful login', async ({
    page,
  }) => {
    await mockLoginApi(page, successResponse('learner', 4));

    await openLogin(page);
    await submitLogin(page, 'learner@system.com', 'Admin@123');

    await expect(page).toHaveURL(/\/learner$/);
  });
});
