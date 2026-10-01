import { apiSuccess } from "@/app/lib/apiResponse";
import { TOKEN_COOKIE } from "@/app/lib/auth";

export async function POST() {
  const response = apiSuccess({}, "Logged out successfully.",200);

  response.cookies.set(TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });

  return response;
}
