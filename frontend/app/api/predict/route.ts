import { NextResponse } from "next/server";

export const runtime = "nodejs";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8000";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const upstreamResponse = await fetch(`${backendUrl}/predict`, {
      method: "POST",
      body: formData,
      cache: "no-store",
    });

    const payload = await upstreamResponse.json().catch(() => ({
      error: "Backend returned a non-JSON response",
    }));

    return NextResponse.json(payload, { status: upstreamResponse.status });
  } catch {
    return NextResponse.json({ error: "Could not reach backend service" }, { status: 502 });
  }
}
