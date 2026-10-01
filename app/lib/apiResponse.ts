import { NextResponse } from "next/server";

export const apiSuccess=<T extends Record<string,unknown>>(data:T,message:string,status:number)=>{
return NextResponse.json({success:true,...data,message},{status});
}

export const apiError=(message:string,status:number)=>{
return NextResponse.json({success:false,message:message},{status})
}

export const apiFailure=(error:unknown,context:String,status:500)=>{
console.log(`context:${error}`);
return apiError(status===500 ? 'Internal Server Error' : 'Something Went Wrong',status)
}