import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">시니어 프로필 등록</h1>
      <p className="text-muted-foreground mb-8">
        정보를 입력하시면 맞춤 일자리를 추천해 드립니다.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">기본 정보</CardTitle>
          <CardDescription className="text-base">
            모든 항목을 빠짐없이 입력해 주세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="text-lg font-semibold">
                이름
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="홍길동"
                className="text-lg h-12"
                disabled
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="region" className="text-lg font-semibold">
                지역
              </Label>
              <Input
                id="region"
                type="text"
                placeholder="예: 서울 강남구"
                className="text-lg h-12"
                disabled
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="desired_job" className="text-lg font-semibold">
                희망 직종
              </Label>
              <Input
                id="desired_job"
                type="text"
                placeholder="예: 경비, 청소, 요양보호"
                className="text-lg h-12"
                disabled
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="career_years" className="text-lg font-semibold">
                경력 (년)
              </Label>
              <Input
                id="career_years"
                type="number"
                placeholder="0"
                min={0}
                className="text-lg h-12"
                disabled
              />
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-xl font-bold bg-blue-600 hover:bg-blue-700 mt-2"
              disabled
            >
              등록하기 (준비 중)
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
