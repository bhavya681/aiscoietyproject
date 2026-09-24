import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/models/User";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  await connectDB();
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ success: false, message: "This fields are required" }, { status: 400 })
    }
    if (!email.includes("@")) {
      return NextResponse.json({ success: true, message: "Enter valid email" }, { status: 400 });
    }
    const UserExists = await User.findOne({ email });
    if (!UserExists) {
      return NextResponse.json({ success: false, message: "User Not Exists,kindly create user" }, { status: 401 })
    }
    const matchPassword = await bcrypt.compare(password, UserExists.password);
    if (!matchPassword) {
      return NextResponse.json({ success: false, message: "User Not authorized" }, { status: 401 })
    }
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }
    const token = jwt.sign({ userId: UserExists._id, role: UserExists.role }, JWT_SECRET, { expiresIn: '7d' });
    // return NextResponse.json({
    //   success: true, token, user: { email: UserExists.email, phone: UserExists.phone, address: UserExists.address, role: UserExists.role, name: UserExists.name }, message: "successfully logged in"
    // }, { status: 201 })
    const response = NextResponse.json(
      {
        success: true,
        message: "Successfully logged in.",
        user: {
          id: UserExists._id,
          name: UserExists.name,
          email: UserExists.email,
          phone: UserExists.phone,
          address: UserExists.address,
          role: UserExists.role,
        },
      },
      { status: 200 }
    );
    
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}