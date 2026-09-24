import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Maintenance from "@/app/models/Maintenance";
import User from "@/app/models/User";

export async function POST(request: Request) {
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

    // Only admin can create maintenance records
    if (userData.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required.",
        },
        { status: 403 }
      );
    }

    const {
      userId,
      amount,
      dueDate,
    } = await request.json();

    if (!userId || !amount || !dueDate) {
      return NextResponse.json(
        {
          success: false,
          message: "userId, amount and dueDate are required.",
        },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Amount must be greater than zero.",
        },
        { status: 400 }
      );
    }

    // Check whether resident exists
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Resident not found.",
        },
        { status: 404 }
      );
    }

    // Prevent duplicate maintenance for the same resident/date
    const existingMaintenance = await Maintenance.findOne({
      user: userId,
      dueDate: new Date(dueDate),
    });

    if (existingMaintenance) {
      return NextResponse.json(
        {
          success: false,
          message: "Maintenance already exists for this due date.",
        },
        { status: 409 }
      );
    }

    const maintenance = await Maintenance.create({
      user: userId,
      amount,
      dueDate: new Date(dueDate),
      status: "pending",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Maintenance created successfully.",
        maintenance,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create maintenance error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}

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
  
      if (userData.role !== "admin") {
        return NextResponse.json(
          {
            success: false,
            message: "Admin access required.",
          },
          { status: 403 }
        );
      }
  
      const maintenance = await Maintenance.find()
        .populate("userId", "-password")
        .sort({
          dueDate: -1,
        });
  
      return NextResponse.json(
        {
          success: true,
          maintenance,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Get all maintenance error:", error);
  
      return NextResponse.json(
        {
          success: false,
          message: "Internal server error.",
        },
        { status: 500 }
      );
    }
  }