import { supabase, type Senior, type Job } from './supabase';

function calcScore(
  senior: Pick<Senior, 'region' | 'desired_job' | 'career_years'>,
  job: Pick<Job, 'region' | 'job_type' | 'required_career'>
): number {
  let score = 0;
  if (senior.region === job.region) score += 3;           // 지역 일치 +3
  if (senior.desired_job === job.job_type) score += 2;    // 직종 일치 +2
  if (senior.career_years >= job.required_career) score += 1; // 경력 충족 +1
  return score; // 최대 6점
}

/** 새 시니어 등록 후 호출 — 해당 시니어 × 전체 일자리 매칭 재계산 */
export async function recalculateMatchesForSenior(seniorId: string): Promise<void> {
  const [{ data: senior, error: e1 }, { data: jobs, error: e2 }] = await Promise.all([
    supabase.from('seniors').select('*').eq('id', seniorId).single(),
    supabase.from('jobs').select('*'),
  ]);
  if (e1) console.error('[matching] seniors 조회 오류:', e1);
  if (e2) console.error('[matching] jobs 조회 오류:', e2);
  if (!senior || !jobs) return;

  const { error: delErr } = await supabase.from('matches').delete().eq('senior_id', seniorId);
  if (delErr) console.error('[matching] matches DELETE 오류:', delErr);
  if (jobs.length === 0) return;

  const { error: insErr } = await supabase.from('matches').insert(
    jobs.map((job) => ({
      senior_id: seniorId,
      job_id: job.id,
      score: calcScore(senior, job),
      status: 'pending',
    }))
  );
  if (insErr) console.error('[matching] matches INSERT 오류:', insErr);
}

/** 새 일자리 등록 후 호출 — 해당 일자리 × 전체 시니어 매칭 계산 후 추가 */
export async function recalculateMatchesForJob(jobId: string): Promise<void> {
  const [{ data: job, error: e1 }, { data: seniors, error: e2 }] = await Promise.all([
    supabase.from('jobs').select('*').eq('id', jobId).single(),
    supabase.from('seniors').select('*'),
  ]);
  if (e1) console.error('[matching] jobs 조회 오류:', e1);
  if (e2) console.error('[matching] seniors 조회 오류:', e2);
  if (!job || !seniors || seniors.length === 0) return;

  const { error: insErr } = await supabase.from('matches').insert(
    seniors.map((senior) => ({
      senior_id: senior.id,
      job_id: jobId,
      score: calcScore(senior, job),
      status: 'pending',
    }))
  );
  if (insErr) console.error('[matching] matches INSERT 오류:', insErr);
}
