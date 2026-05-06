'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase, type Job } from '@/lib/supabase';
import { recalculateMatchesForJob } from '@/lib/matching';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const REGIONS = ['서울', '경기', '인천', '기타'];
const JOB_TYPES = ['경비', '청소', '조리', '돌봄', '기타'];

type MatchInfo = { score: number; status: string };
type SeniorWithStats = {
  id: string; name: string; region: string; desired_job: string; career_years: number;
  matches: MatchInfo[];
};
type JobForm = { title: string; region: string; job_type: string; required_career: string };
type FormErrors = Partial<JobForm>;

function getSeniorStatus(matches: MatchInfo[]): 'unmatched' | 'pending' | 'assigned' {
  if (!matches.length || matches.every((m) => m.score === 0)) return 'unmatched';
  if (matches.some((m) => m.status === 'assigned' || m.status === 'done')) return 'assigned';
  return 'pending';
}

function getMaxScore(matches: MatchInfo[]): number {
  if (!matches.length) return 0;
  return Math.max(...matches.map((m) => m.score));
}

const STATUS_CONFIG = {
  unmatched: { label: '미매칭', badgeClass: 'bg-gray-500', desc: '아직 매칭되지 않은 시니어' },
  pending:   { label: '매칭 대기', badgeClass: 'bg-yellow-500', desc: '매칭은 됐으나 배정 전 검토 중' },
  assigned:  { label: '배정 완료', badgeClass: 'bg-green-600', desc: '일자리 배정이 확정된 시니어' },
} as const;

export default function AdminPage() {
  const [seniors, setSeniors] = useState<SeniorWithStats[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [form, setForm] = useState<JobForm>({ title: '', region: '', job_type: '', required_career: '0' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    const [{ data: seniorsRaw }, { data: jobsRaw }] = await Promise.all([
      supabase
        .from('seniors')
        .select('id, name, region, desired_job, career_years, matches(score, status)')
        .order('created_at', { ascending: false }),
      supabase.from('jobs').select('*').order('created_at', { ascending: false }),
    ]);
    if (seniorsRaw) setSeniors(seniorsRaw as SeniorWithStats[]);
    if (jobsRaw) setJobs(jobsRaw as Job[]);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const stats = {
    unmatched: seniors.filter((s) => getSeniorStatus(s.matches) === 'unmatched').length,
    pending:   seniors.filter((s) => getSeniorStatus(s.matches) === 'pending').length,
    assigned:  seniors.filter((s) => getSeniorStatus(s.matches) === 'assigned').length,
  };

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!form.title.trim()) e.title = '공고명을 입력해 주세요.';
    if (!form.region) e.region = '지역을 선택해 주세요.';
    if (!form.job_type) e.job_type = '직종을 선택해 주세요.';
    return e;
  }

  async function handleAddJob(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    const { data: newJob, error } = await supabase
      .from('jobs')
      .insert({ title: form.title.trim(), region: form.region, job_type: form.job_type, required_career: parseInt(form.required_career) || 0 })
      .select()
      .single();
    if (!error && newJob) {
      await recalculateMatchesForJob(newJob.id);
      setForm({ title: '', region: '', job_type: '', required_career: '0' });
      await fetchAll();
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await supabase.from('jobs').delete().eq('id', id);
    setDeletingId(null);
    await fetchAll();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">담당자 대시보드</h1>
      <p className="text-muted-foreground mb-8">매칭 현황을 한눈에 확인하고 배정을 관리하세요.</p>

      {/* 집계 카드 */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {(Object.keys(STATUS_CONFIG) as Array<keyof typeof STATUS_CONFIG>).map((key) => (
          <Card key={key}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{STATUS_CONFIG[key].label}</CardTitle>
                <Badge className={`text-white ${STATUS_CONFIG[key].badgeClass}`}>{stats[key]}명</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{STATUS_CONFIG[key].desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 시니어 목록 테이블 */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold mb-4">시니어 목록 ({seniors.length}명)</h2>
        <Card>
          <CardContent className="pt-4">
            {seniors.length === 0 ? (
              <div className="flex items-center justify-center py-10 border-2 border-dashed rounded-xl text-muted-foreground text-lg">
                등록된 시니어가 없습니다
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-base">
                  <thead>
                    <tr className="border-b text-left">
                      {['이름', '지역', '희망 직종', '최고 점수', '상태', ''].map((h) => (
                        <th key={h} className="pb-3 pr-4 font-semibold text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {seniors.map((senior) => {
                      const status = getSeniorStatus(senior.matches);
                      const maxScore = getMaxScore(senior.matches);
                      const cfg = STATUS_CONFIG[status];
                      return (
                        <tr key={senior.id} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="py-3 pr-4 font-medium">{senior.name}</td>
                          <td className="py-3 pr-4">{senior.region}</td>
                          <td className="py-3 pr-4">{senior.desired_job}</td>
                          <td className="py-3 pr-4">
                            <span className={`font-bold ${maxScore >= 4 ? 'text-green-600' : maxScore > 0 ? 'text-gray-600' : 'text-gray-400'}`}>
                              {maxScore}점
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <Badge className={`text-white ${cfg.badgeClass}`}>{cfg.label}</Badge>
                          </td>
                          <td className="py-3">
                            <Link href={`/recommendations?senior_id=${senior.id}`}>
                              <Button variant="outline" size="sm" className="text-base">상세 보기</Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* 일자리 관리 */}
      <section>
        <h2 className="text-2xl font-bold mb-6 border-t pt-8">일자리 관리</h2>

        {/* 일자리 추가 폼 */}
        <Card className="mb-8">
          <CardHeader><CardTitle className="text-xl">일자리 추가</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleAddJob} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label className="text-lg font-semibold">공고명 *</Label>
                {errors.title && <div className="rounded bg-red-100 border border-red-400 text-red-700 text-base px-3 py-2">{errors.title}</div>}
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="예: 아파트 경비원 모집" className="text-lg h-12" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-lg font-semibold">지역 *</Label>
                  {errors.region && <div className="rounded bg-red-100 border border-red-400 text-red-700 text-base px-3 py-2">{errors.region}</div>}
                  <Select value={form.region} onValueChange={(v) => setForm({ ...form, region: v })}>
                    <SelectTrigger className="text-lg h-12"><SelectValue placeholder="지역 선택" /></SelectTrigger>
                    <SelectContent>{REGIONS.map((r) => <SelectItem key={r} value={r} className="text-lg">{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-lg font-semibold">직종 *</Label>
                  {errors.job_type && <div className="rounded bg-red-100 border border-red-400 text-red-700 text-base px-3 py-2">{errors.job_type}</div>}
                  <Select value={form.job_type} onValueChange={(v) => setForm({ ...form, job_type: v })}>
                    <SelectTrigger className="text-lg h-12"><SelectValue placeholder="직종 선택" /></SelectTrigger>
                    <SelectContent>{JOB_TYPES.map((j) => <SelectItem key={j} value={j} className="text-lg">{j}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-lg font-semibold">요구 경력 (년)</Label>
                <Input type="number" min={0} value={form.required_career} onChange={(e) => setForm({ ...form, required_career: e.target.value })} className="text-lg h-12 max-w-xs" />
              </div>

              <Button type="submit" className="h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700 w-full sm:w-48" disabled={loading}>
                {loading ? '저장 및 매칭 중...' : '+ 일자리 추가'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 일자리 목록 */}
        <Card>
          <CardHeader><CardTitle className="text-xl">등록된 일자리 ({jobs.length}건)</CardTitle></CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <div className="flex items-center justify-center py-10 border-2 border-dashed rounded-xl text-muted-foreground text-lg">
                등록된 일자리가 없습니다
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-base">
                  <thead>
                    <tr className="border-b text-left">
                      {['공고명', '지역', '직종', '요구 경력', ''].map((h) => (
                        <th key={h} className="pb-3 pr-4 font-semibold text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="py-3 pr-4 font-medium">{job.title}</td>
                        <td className="py-3 pr-4">{job.region}</td>
                        <td className="py-3 pr-4">{job.job_type}</td>
                        <td className="py-3 pr-4">{job.required_career}년 이상</td>
                        <td className="py-3">
                          <Button variant="destructive" size="sm" className="text-base px-4"
                            disabled={deletingId === job.id} onClick={() => handleDelete(job.id)}>
                            {deletingId === job.id ? '삭제 중...' : '삭제'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
