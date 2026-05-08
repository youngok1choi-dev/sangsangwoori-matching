import { test, expect } from '@playwright/test';
import { db, resetDB } from './helpers/db';

test.beforeEach(async () => {
  await resetDB();
});

test('실패 시나리오: 이름 미입력 시 빨간 오류 박스 표시 및 DB 미저장', async ({ page }) => {
  // 사전 카운트 (beforeEach 이후 0이어야 함)
  const { count: before } = await db
    .from('seniors')
    .select('*', { count: 'exact', head: true });

  await page.goto('/register');

  // 이름 비움
  await page.selectOption('#region', '서울');
  await page.selectOption('#desired_job', '경비');
  await page.fill('#career_years', '3');

  await page.click('button[type="submit"]');

  // 이름 필드 위 빨간 안내 박스
  const errorBox = page.locator('text=이름을 입력해 주세요');
  await expect(errorBox).toBeVisible({ timeout: 5_000 });

  // DB: 새 레코드 없음
  const { count: after } = await db
    .from('seniors')
    .select('*', { count: 'exact', head: true });
  expect(after).toBe(before);
});
