import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/models/User";
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
await connectDB();
    try {
        const { name, email, password, phone, address, role } = await request.json();
        if (!name || !email || !password || !phone || !address || !role) {
            return NextResponse.json({ success: false, message: "All Fields are required" }, { status: 400 })
        }
        if (!email.includes("@")) {
            return NextResponse.json({ success: false, message: "Enter Valid Email Address" }, { status: 400 })
        }
        if(password.length<8){
            return NextResponse.json({success:false,message:"Password should strong"},{status:400})
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ success: true, message: "User Already Exists,Kindly Login" }, { status: 409 })
        }
        const hashword=await bcrypt.hash(password,8);
        const newUser = await User.create({
            name:name, email:email, password:hashword, phone:phone, address:address, role:role
        });
        return NextResponse.json({ success: true, user: { name:newUser.name, email:newUser.email,
             phone:newUser.phone, address:newUser.address, role:newUser.role }, message: 'New user succesfully created' }, { status: 201 })
    } catch (error) {
        console.error('error:', error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 })
    }
}