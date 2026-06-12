import { NextResponse } from "next/server";

const AI_DIAGNOSIS_ENDPOINT =
  process.env.NEXT_PUBLIC_DIAGNOSIS_API_URL ??
  process.env.AI_DIAGNOSIS_ENDPOINT ??
  process.env.AI_DIAGNOSIS_KEY ??
  process.env.NEXT_PUBLIC_AI_DIAGNOSIS_KEY ??
  process.env.REACT_APP_AI_DIAGNOSIS_KEY;

function getPredictUrl() {
  if (!AI_DIAGNOSIS_ENDPOINT) {
    return null;
  }

  return `${AI_DIAGNOSIS_ENDPOINT.replace(/\/$/, "")}/predict`;
}

export async function POST(request: Request) {
  const predictUrl = getPredictUrl();

  if (!predictUrl) {
    return NextResponse.json(
      { error: "AI diagnosis endpoint is not configured." },
      { status: 500 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Image file is required." },
        { status: 400 },
      );
    }

    const proxyFormData = new FormData();
    proxyFormData.append("file", file);

    const response = await fetch(predictUrl, {
      method: "POST",
      body: proxyFormData,
    });

    const responseText = await response.text();
    const contentType = response.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
      ? JSON.parse(responseText)
      : { error: responseText || "AI diagnosis request failed." };

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "AI diagnosis request failed.",
      },
      { status: 500 },
    );
  }
}
