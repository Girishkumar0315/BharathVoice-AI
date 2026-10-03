import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return NextResponse.json({ status: "saved", profile: body });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to save profile" }, { status: 400 });
  }
}
