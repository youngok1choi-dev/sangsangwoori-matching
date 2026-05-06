'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const REGIONS = ['서울', '경기', '인천', '기타'];
const JOB_TYPES = ['경비', '청소', '조리', '돌봄', '기타'];

type FormData = {
  name: string;
  region: string;
  desired_job: string;
  career_years: string;
};

type Errors = Partial<Record<keyof FormData, string>>;

export default function RegisterPage() {
  const [form, setForm] = useState<FormData>({ name: '', region: '', desired_job: '', career_years: '0' });
  const [errors, setErrors] = useState<Errors>({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function validate(): Errors {
    const e: Errors = {};
    if (!form.name.trim()) e.name = '이름을 입력해 주세요.';
    if (!form.region) e.region = '지역을 선택해 주세요.';
    if (!form.desired_job) e.desired_job = '희망 직종을 선택해 주세요.';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSuccess(false);
    setLoading(true);
    const { error } = await supabase.from('seniors').insert({
      name: form.name.trim(),
      region: form.region,
      desired_job: form.desired_job,
      career_years: parseInt(form.career_years) || 0,
    });
    setLoading(false);
    if (error) {
      setErrors({ name: '저장 중 오류가 발생했습니다. 다시 시도해 주세요.' });
    } else {
      setSuccess(true);
      setForm({ name: '', region: '', desired_job: '', career_years: '0' });
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">시니어 프로필 등록</h1>
      <p className="text-muted-foreground mb-8">
        정보를 입력하시면 맞춤 일자리를 추천해 드립니다.
      </p>

      {success && (
        <div className="mb-6 rounded-lg bg-green-100 border border-green-500 text-green-800 text-lg font-semibold px-5 py-4">
          ✓ 등록이 완료되었습니다
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">기본 정보</CardTitle>
          <CardDescription className="text-base">
            ※ 이름 · 지역 · 희망 직종은 필수 항목입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* 이름 */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="text-lg font-semibold">이름 *</Label>
              {errors.name && (
                <div className="rounded bg-red-100 border border-red-400 text-red-700 text-base px-3 py-2">
                  {errors.name}
                </div>
              )}
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="홍길동"
                className="text-lg h-12"
              />
            </div>

            {/* 지역 */}
            <div className="flex flex-col gap-2">
              <Label className="text-lg font-semibold">지역 *</Label>
              {errors.region && (
                <div className="rounded bg-red-100 border border-red-400 text-red-700 text-base px-3 py-2">
                  {errors.region}
                </div>
              )}
              <Select value={form.region} onValueChange={(v) => setForm({ ...form, region: v })}>
                <SelectTrigger className="text-lg h-12">
                  <SelectValue placeholder="지역을 선택해 주세요" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => (
                    <SelectItem key={r} value={r} className="text-lg">{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 희망 직종 */}
            <div className="flex flex-col gap-2">
              <Label className="text-lg font-semibold">희망 직종 *</Label>
              {errors.desired_job && (
                <div className="rounded bg-red-100 border border-red-400 text-red-700 text-base px-3 py-2">
                  {errors.desired_job}
                </div>
              )}
              <Select value={form.desired_job} onValueChange={(v) => setForm({ ...form, desired_job: v })}>
                <SelectTrigger className="text-lg h-12">
                  <SelectValue placeholder="직종을 선택해 주세요" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map((j) => (
                    <SelectItem key={j} value={j} className="text-lg">{j}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 경력 */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="career_years" className="text-lg font-semibold">경력 (년)</Label>
              <Input
                id="career_years"
                type="number"
                min={0}
                value={form.career_years}
                onChange={(e) => setForm({ ...form, career_years: e.target.value })}
                className="text-lg h-12"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-xl font-bold bg-blue-600 hover:bg-blue-700 mt-2"
              disabled={loading}
            >
              {loading ? '저장 중...' : '등록하기'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
