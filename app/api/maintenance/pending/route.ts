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

    const maintenance = await Maintenance.find({
      user: userData.userId,
      status: {
        $in: ["pending", "overdue"],
      },
    }).sort({
      dueDate: 1,
    });

    const totalPending = maintenance.reduce(
      (total, item) => total + item.amount,
      0
    );

    return NextResponse.json(
      {
        success: true,
        totalPending,
        maintenance,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Pending maintenance error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}