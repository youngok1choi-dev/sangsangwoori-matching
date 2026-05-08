import { test, expect } from '@playwright/test';
import { db, resetDB } from './helpers/db';

test.beforeEach(async () => {
  await resetDB();
  // 기타/기타 공고 — 지역(+0) · 직종(+0) 불일치, required_career=10 으로
  // 경력 3년도 미달(+0) → 총점 0 → 추천 목록에서 필터링됨.
  // (required_career=0 이면 경력 조건 충족 +1 이 되어 score=1로 노출되므로 10 사용)
  const { error } = await db.from('jobs').insert({
    title: '기타 업무',
    region: '기타',
    job_type: '기타',
    required_career: 10,
  });
  if (error) throw new Error(`[beforeEach] jobs insert 실패: ${error.message}`);
});

test('엣지 시나리오: 매칭 0점 공고만 있을 때 "현재 매칭되는 일자리가 없습니다" 안내 표시', async ({ page }) => {
  await page.goto('/register');

  await page.fill('#name', '테스트시니어');
  await page.selectOption('#region', '서울');
  await page.selectOption('#desired_job', '경비');
  await page.fill('#career_years', '3');

  await page.click('button[type="submit"]');

  // 등록 완료 확인 후 추천 페이지로 이동
  await expect(page.locator('text=등록이 완료되었습니다')).toBeVisible({ timeout: 15_000 });

  const link = page.locator('a[href*="/recommendations?senior_id="]');
  const href = await link.getAttribute('href');
  expect(href).toBeTruthy();

  await page.goto(href!);

  // 매칭 없음 안내 박스
  const noMatchBox = page.locator('text=현재 매칭되는 일자리가 없습니다');
  await expect(noMatchBox).toBeVisible({ timeout: 10_000 });
});
