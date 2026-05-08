import { test, expect } from '@playwright/test';
import { db, resetDB } from './helpers/db';

test.beforeEach(async () => {
  await resetDB();
  // 서울/경비/요구경력 3년 공고 1건 삽입 → senior(서울/경비/5년)와 완전 일치 → 6점
  const { error } = await db.from('jobs').insert({
    title: '서울 경비원 모집',
    region: '서울',
    job_type: '경비',
    required_career: 3,
  });
  if (error) throw new Error(`[beforeEach] jobs insert 실패: ${error.message}`);
});

test('정상 시나리오: 등록 완료 메시지 노출 및 추천 목록 6점 금색 배지 상단 표시', async ({ page }) => {
  await page.goto('/register');

  await page.fill('#name', '테스트시니어');
  await page.selectOption('#region', '서울');
  await page.selectOption('#desired_job', '경비');
  await page.fill('#career_years', '5');

  await page.click('button[type="submit"]');

  // 초록 성공 박스
  const successBox = page.locator('text=등록이 완료되었습니다');
  await expect(successBox).toBeVisible({ timeout: 15_000 });

  // 추천 링크에서 senior_id 추출 후 이동
  const link = page.locator('a[href*="/recommendations?senior_id="]');
  const href = await link.getAttribute('href');
  expect(href).toBeTruthy();

  await page.goto(href!);

  // 6점 금색 배지 (bg-yellow-500) 카드가 최상단에 표시
  const badge = page.locator('.bg-yellow-500').first();
  await expect(badge).toBeVisible({ timeout: 10_000 });
  await expect(badge).toContainText('6점');
});
