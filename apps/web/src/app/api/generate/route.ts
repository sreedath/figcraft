import { NextRequest, NextResponse } from "next/server";
import type { GenerateRequest, GenerateResponse } from "@/types/api";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateRequest;

    if (!body.prompt || typeof body.prompt !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid prompt" } satisfies GenerateResponse,
        { status: 400 }
      );
    }

    if (!body.apiKey || typeof body.apiKey !== "string") {
      return NextResponse.json(
        { error: "Missing API key" } satisfies GenerateResponse,
        { status: 400 }
      );
    }

    // Forward to OpenAI (done client-side for MVP to keep API key in browser)
    // This route exists for future server-side processing
    return NextResponse.json(
      { error: "Use client-side generation for MVP" } satisfies GenerateResponse,
      { status: 501 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" } satisfies GenerateResponse,
      { status: 500 }
    );
  }
}
