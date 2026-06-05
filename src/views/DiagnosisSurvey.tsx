"use client";

import { HiArrowRight, HiSparkles } from "react-icons/hi2";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useNavigate } from "../lib/router";

export default function DiagnosisSurvey() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-dvh items-center justify-center bg-cream-50 px-5 py-8">
      <Card className="w-full max-w-xl border-none bg-white">
        <CardHeader>
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-cream-100 text-brown-600">
            <HiSparkles className="size-7" aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl text-brown-600">추가 설문은 준비 중입니다</CardTitle>
          <CardDescription className="text-base leading-7">
            브라우저 저장소를 사용하지 않도록 변경하면서, 설문 보정 결과도 DB 저장 방식으로 다시 연결할 예정입니다. 현재는 저장된 최신 AI 진단 결과를 바로 확인할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" size="lg" className="w-full rounded-full" onClick={() => navigate("/result", { replace: true })}>
            진단 결과 보기
            <HiArrowRight className="size-5" aria-hidden="true" />
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
