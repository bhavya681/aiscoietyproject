import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/models/User";

export async function PUT(request: Request) {
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
    const userId = userData.userId;

    const { name, phone, address } = await request.json();

    if (!name && !phone && !address) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one field is required.",
        },
        { status: 400 }
      );
    }

    const updateData: {
      name?: string;
      phone?: number;
      address?: string;
    } = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully.",
        user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update profile error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}