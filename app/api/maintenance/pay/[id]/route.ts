import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Maintenance from "@/app/models/Maintenance";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const { paymentMethod } = await request.json();

    const allowedMethods = [
      "upi",
      "bank_transfer",
      "cash",
      "other",
    ];

    if (!allowedMethods.includes(paymentMethod)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment method.",
        },
        { status: 400 }
      );
    }

    const maintenance = await Maintenance.findOne({
      _id: id,
      user: userData.userId,
    });

    if (!maintenance) {
      return NextResponse.json(
        {
          success: false,
          message: "Maintenance record not found.",
        },
        { status: 404 }
      );
    }

    if (maintenance.status === "paid") {
      return NextResponse.json(
        {
          success: false,
          message: "This maintenance has already been paid.",
        },
        { status: 409 }
      );
    }

    maintenance.status = "paid";
    maintenance.paidAt = new Date();
    maintenance.paymentMethod = paymentMethod;

    await maintenance.save();

    return NextResponse.json(
      {
        success: true,
        message: "Maintenance marked as paid.",
        maintenance,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Payment error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}