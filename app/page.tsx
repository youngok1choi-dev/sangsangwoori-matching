import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 text-center">
      <div>
        <h1 className="text-4xl font-bold text-blue-700 mb-3">상상우리</h1>
        <p className="text-xl text-muted-foreground">
          시니어와 일자리를 자동으로 연결합니다
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/register"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 text-white text-xl font-semibold px-8 py-4 hover:bg-blue-700 transition-colors"
        >
          프로필 등록하기
        </Link>
        <Link
          href="/recommendations"
          className="inline-flex items-center justify-center rounded-lg border-2 border-blue-600 text-blue-600 text-xl font-semibold px-8 py-4 hover:bg-blue-50 transition-colors"
        >
          추천 일자리 보기
        </Link>
      </div>
    </div>
  );
}
