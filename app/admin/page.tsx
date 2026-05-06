import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const sections = [
  {
    key: "unmatched",
    title: "미매칭",
    description: "아직 매칭되지 않은 시니어",
    badgeClass: "bg-gray-500",
    count: 0,
  },
  {
    key: "pending",
    title: "매칭 대기",
    description: "매칭은 됐으나 배정 전 검토 중",
    badgeClass: "bg-yellow-500",
    count: 0,
  },
  {
    key: "assigned",
    title: "배정 완료",
    description: "일자리 배정이 확정된 시니어",
    badgeClass: "bg-green-600",
    count: 0,
  },
];

export default function AdminPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">담당자 대시보드</h1>
      <p className="text-muted-foreground mb-8">
        매칭 현황을 한눈에 확인하고 배정을 관리하세요.
      </p>

      {/* 요약 통계 */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {sections.map((s) => (
          <Card key={s.key}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{s.title}</CardTitle>
                <Badge className={`text-white ${s.badgeClass}`}>
                  {s.count}건
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{s.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 섹션별 목록 */}
      <div className="flex flex-col gap-8">
        {sections.map((s) => (
          <section key={s.key}>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              {s.title}
              <Badge className={`text-white text-sm ${s.badgeClass}`}>
                {s.count}
              </Badge>
            </h2>

            {/* 빈 상태 */}
            <div className="flex items-center justify-center py-10 border-2 border-dashed rounded-xl text-muted-foreground text-lg">
              해당 항목이 없습니다
            </div>

            {/* 테이블 자리 (기능 구현 후 교체 예정) */}
          </section>
        ))}
      </div>
    </div>
  );
}
