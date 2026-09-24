import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Maintenance from "@/app/models/Maintenance";

export async function GET(request: Request) {
  try {
    await connectDB();

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

    const userData = JSON.parse(userHeader);

    const history = await Maintenance.find({
      user: userData.userId,
    }).sort({
      createdAt: -1,
    });

    return NextResponse.json(
      {
        success: true,
        history,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Maintenance history error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}