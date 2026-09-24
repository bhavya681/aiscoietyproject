import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/models/User";

export async function GET(request: Request) {
  try {
    await connectDB();
    const userHeader = request.headers.get('x-user');
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
    const profile = await User.findById(userId).select("-password");
    if (!profile) {
      return NextResponse.json({ success: false, message: "User Not Exists" }, { status: 404 })
    }
    return NextResponse.json({ success: true, profile, message: "fetched profile" }, { status: 200 })
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
