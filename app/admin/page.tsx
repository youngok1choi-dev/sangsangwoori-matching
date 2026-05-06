'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, type Job } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const REGIONS = ['서울', '경기', '인천', '기타'];
const JOB_TYPES = ['경비', '청소', '조리', '돌봄', '기타'];

const STATUS_SECTIONS = [
  { key: 'unmatched', title: '미매칭', description: '아직 매칭되지 않은 시니어', badgeClass: 'bg-gray-500' },
  { key: 'pending',   title: '매칭 대기', description: '매칭은 됐으나 배정 전 검토 중', badgeClass: 'bg-yellow-500' },
  { key: 'assigned',  title: '배정 완료', description: '일자리 배정이 확정된 시니어', badgeClass: 'bg-green-600' },
];

type JobForm = { title: string; region: string; job_type: string; required_career: string };
type FormErrors = Partial<JobForm>;

export default function AdminPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [form, setForm] = useState<JobForm>({ title: '', region: '', job_type: '', required_career: '0' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    const { data } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
    if (data) setJobs(data as Job[]);
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

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
    const { error } = await supabase.from('jobs').insert({
      title: form.title.trim(),
      region: form.region,
      job_type: form.job_type,
      required_career: parseInt(form.required_career) || 0,
    });
    setLoading(false);
    if (!error) {
      setForm({ title: '', region: '', job_type: '', required_career: '0' });
      fetchJobs();
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await supabase.from('jobs').delete().eq('id', id);
    setDeletingId(null);
    fetchJobs();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">담당자 대시보드</h1>
      <p className="text-muted-foreground mb-8">매칭 현황을 한눈에 확인하고 배정을 관리하세요.</p>

      {/* 요약 통계 카드 */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {STATUS_SECTIONS.map((s) => (
          <Card key={s.key}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{s.title}</CardTitle>
                <Badge className={`text-white ${s.badgeClass}`}>0건</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{s.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 매칭 현황 섹션 */}
      <div className="flex flex-col gap-8 mb-14">
        {STATUS_SECTIONS.map((s) => (
          <section key={s.key}>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              {s.title}
              <Badge className={`text-white text-sm ${s.badgeClass}`}>0</Badge>
            </h2>
            <div className="flex items-center justify-center py-10 border-2 border-dashed rounded-xl text-muted-foreground text-lg">
              해당 항목이 없습니다
            </div>
          </section>
        ))}
      </div>

      {/* 일자리 관리 */}
      <section>
        <h2 className="text-2xl font-bold mb-6 border-t pt-8">일자리 관리</h2>

        {/* 일자리 추가 폼 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">일자리 추가</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddJob} className="flex flex-col gap-5">
              {/* 공고명 */}
              <div className="flex flex-col gap-2">
                <Label className="text-lg font-semibold">공고명 *</Label>
                {errors.title && (
                  <div className="rounded bg-red-100 border border-red-400 text-red-700 text-base px-3 py-2">
                    {errors.title}
                  </div>
                )}
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="예: 아파트 경비원 모집"
                  className="text-lg h-12"
                />
              </div>

              {/* 지역 + 직종 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-lg font-semibold">지역 *</Label>
                  {errors.region && (
                    <div className="rounded bg-red-100 border border-red-400 text-red-700 text-base px-3 py-2">
                      {errors.region}
                    </div>
                  )}
                  <Select value={form.region} onValueChange={(v) => setForm({ ...form, region: v })}>
                    <SelectTrigger className="text-lg h-12">
                      <SelectValue placeholder="지역 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIONS.map((r) => (
                        <SelectItem key={r} value={r} className="text-lg">{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-lg font-semibold">직종 *</Label>
                  {errors.job_type && (
                    <div className="rounded bg-red-100 border border-red-400 text-red-700 text-base px-3 py-2">
                      {errors.job_type}
                    </div>
                  )}
                  <Select value={form.job_type} onValueChange={(v) => setForm({ ...form, job_type: v })}>
                    <SelectTrigger className="text-lg h-12">
                      <SelectValue placeholder="직종 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {JOB_TYPES.map((j) => (
                        <SelectItem key={j} value={j} className="text-lg">{j}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 요구 경력 */}
              <div className="flex flex-col gap-2">
                <Label className="text-lg font-semibold">요구 경력 (년)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.required_career}
                  onChange={(e) => setForm({ ...form, required_career: e.target.value })}
                  className="text-lg h-12 max-w-xs"
                />
              </div>

              <Button
                type="submit"
                className="h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700 w-full sm:w-48"
                disabled={loading}
              >
                {loading ? '저장 중...' : '+ 일자리 추가'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 일자리 목록 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">등록된 일자리 ({jobs.length}건)</CardTitle>
          </CardHeader>
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
                      <th className="pb-3 pr-4 font-semibold text-muted-foreground">공고명</th>
                      <th className="pb-3 pr-4 font-semibold text-muted-foreground">지역</th>
                      <th className="pb-3 pr-4 font-semibold text-muted-foreground">직종</th>
                      <th className="pb-3 pr-4 font-semibold text-muted-foreground">요구 경력</th>
                      <th className="pb-3 font-semibold text-muted-foreground"></th>
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
                          <Button
                            variant="destructive"
                            size="sm"
                            className="text-base px-4"
                            disabled={deletingId === job.id}
                            onClick={() => handleDelete(job.id)}
                          >
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
