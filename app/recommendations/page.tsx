import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RecommendationsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">맞춤 일자리 추천</h1>
      <p className="text-muted-foreground mb-8">
        프로필 기반으로 자동 매칭된 일자리 목록입니다. (점수 높은 순)
      </p>

      {/* 추천 목록 — 기능 구현 전 빈 상태 */}
      <div className="flex flex-col gap-4">
        {/* 빈 상태 안내 */}
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-xl">
          <p className="text-2xl font-semibold text-muted-foreground mb-2">
            추천 일자리가 없습니다
          </p>
          <p className="text-lg text-muted-foreground">
            프로필을 등록하면 자동으로 매칭이 시작됩니다.
          </p>
        </div>

        {/* 카드 레이아웃 예시 (기능 구현 후 반복 렌더링 예정) */}
        <div className="opacity-30 pointer-events-none">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl">일자리 제목</CardTitle>
                <p className="text-base text-muted-foreground mt-1">
                  지역 · 직종
                </p>
              </div>
              <Badge className="text-base px-3 py-1 bg-blue-600">
                점수: 95
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-base text-muted-foreground">
                필요 경력: 0년 이상
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
