import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type MatchRow = {
  id: string;
  score: number;
  status: string;
  jobs: {
    title: string;
    region: string;
    job_type: string;
    required_career: number;
  } | null;
};

function ScoreBadge({ score }: { score: number }) {
  const cls =
    score === 6 ? 'bg-yellow-500 text-white'
    : score >= 4 ? 'bg-green-600 text-white'
    : 'bg-gray-500 text-white';
  const label =
    score === 6 ? '매우 적합'
    : score >= 4 ? '적합'
    : score >= 2 ? '보통'
    : '';
  return (
    <div className="flex flex-col items-end gap-1 shrink-0">
      <Badge className={`${cls} text-lg px-3 py-1`}>{score}점</Badge>
      {label && <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">{label}</span>}
    </div>
  );
}

export default async function RecommendationsPage({
  searchParams,
}: {
  searchParams: Promise<{ senior_id?: string }>;
}) {
  const { senior_id: seniorId } = await searchParams;

  if (!seniorId) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">맞춤 일자리 추천</h1>
        <div className="rounded-lg bg-yellow-50 border border-yellow-400 text-yellow-800 text-lg px-5 py-4">
          시니어 ID가 필요합니다.{' '}
          <Link href="/register" className="underline font-semibold">프로필을 등록</Link>
          하면 자동으로 연결됩니다.
        </div>
      </div>
    );
  }

  const { data: senior } = await supabase
    .from('seniors')
    .select('name, region, desired_job')
    .eq('id', seniorId)
    .single();

  if (!senior) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">맞춤 일자리 추천</h1>
        <div className="rounded-lg bg-red-50 border border-red-400 text-red-800 text-lg px-5 py-4">
          시니어 정보를 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  const { data: raw } = await supabase
    .from('matches')
    .select('id, score, status, jobs(title, region, job_type, required_career)')
    .eq('senior_id', seniorId)
    .order('score', { ascending: false });

  const matches = ((raw ?? []) as unknown as MatchRow[]).filter((m) => m.score > 0);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">{senior.name} 님께 맞는 일자리</h1>
      <p className="text-lg text-muted-foreground mb-8">
        {senior.region} · {senior.desired_job} — 점수 높은 순
      </p>

      {matches.length === 0 ? (
        <div className="rounded-lg bg-yellow-50 border-2 border-yellow-400 text-yellow-800 text-lg px-5 py-5">
          <p className="font-bold text-xl mb-1">현재 매칭되는 일자리가 없습니다.</p>
          <p>담당자가 직접 연락드리니 잠시만 기다려 주세요.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {matches.map((match) => {
            const job = match.jobs;
            if (!job) return null;
            return (
              <Card key={match.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl">{job.title}</CardTitle>
                    <p className="text-base text-muted-foreground mt-1">
                      {job.region} · {job.job_type}
                    </p>
                  </div>
                  <ScoreBadge score={match.score} />
                </CardHeader>
                <CardContent>
                  <p className="text-base text-muted-foreground">
                    필요 경력: {job.required_career}년 이상
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="mt-8">
        <Link href="/register" className="text-blue-600 hover:underline text-lg">
          ← 프로필 수정하기
        </Link>
      </div>
    </div>
  );
}
