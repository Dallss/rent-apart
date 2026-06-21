import { NextResponse } from "next/server";

const COOKIE_NAMES = ["access_token", "refresh_token"];

export async function POST() {
  const response = NextResponse.json({ success: true });

  for (const name of COOKIE_NAMES) {
    response.cookies.set({
      name,
      value: "",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(0),
      maxAge: 0,
    });
  }

  return response;
}
