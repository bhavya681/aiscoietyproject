import { NextResponse } from "next/server";

import { askMaintenanceAssistant } from "@/app/lib/ai/tools/maintenanceAssistant";

export async function POST(request: Request) {
  try {
    const userHeader = request.headers.get("x-user");

    if (!userHeader) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        { status: 401 }
      );
    }

    const user = JSON.parse(userHeader);

    const { question } = await request.json();

    if (!question) {
      return NextResponse.json(
        {
          success: false,
          message: "Question is required.",
        },
        { status: 400 }
      );
    }

    const answer = await askMaintenanceAssistant(
      question,
      user.userId
    );

    return NextResponse.json({
      success: true,
      answer,
    });
  } catch (error) {
    console.error("AI chat error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "AI assistant failed.",
      },
      { status: 500 }
    );
  }
}